/*
 * @Author: Pablo Benito <pelicanorojo> bioingbenito@gmail.com
 * @Date: 2024-12-27T11:22:32-03:00
 * @Last modified by: Pablo Benito <pelicanorojo>
 * @Last modified time: 2025-01-15T01:22:00-03:00
 */


import { getDefaultReference, getDirectPathValue, setDirectPathValue
  , each, fanOut, extractOLeaves
  , fanIn, injectOLeaves } from '@src/POJOArrayMapper';

describe (`getDefaultReference`, () => {
  it(`Should always return the same default reference.`, () => {
    let r1 = getDefaultReference();
    let r2 = getDefaultReference();
    expect(r1).toBe(r2);
  })
});

describe(`getDirectPathValue`, () => {
  it(`Should return default value when directPath with no string`, () => {
    let o = {a: 1};
    let path, result;
    path = [6];
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(getDefaultReference());
  });

  it(`Should return the root object when paths is [], '', or '..' or ['', ''].`, () => {
    let o = {a: 1};
    let path, result;
    path = [];
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(o);

    path = '';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(o);

    path = '..';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(o);

    path = ['',''];
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(o);
  });
  
  it(`Should ignore '' in the middle`, () => {
    let o = {a: {b:1}};
    let path, result;
    path = 'a.....b';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(1);

    path = ['a', '', '', 'b'];
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(1);
  });

  it(`Should ignore '' in the tip`, () => {
    let o = {a: {b:1}};
    let path, result;
    path = 'a.b...';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(1);

    path = ['a', 'b', '', ''];
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(1);
  });

  it(`Should works well with '' properties`, () => {
    let o = {'': {'': 5}};
    let path, result;

    path = '""';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual({'': 5});

    path = '"".""';
    result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(5);
  });

  it(`Should point well a direct nested object property`, () => {
    let o = {a: {b: {c: 5}}};
    const path = 'a.b.c';
    const result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(5);
  });

  it(`Should point well a direct nested array value`, () => {
    let o = [null, [null, [null, 5]]];
    const path = '1.1.1';
    const result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(5);
  });

  it(`Should point well a direct property with array, and object mixed`, () => {
    const o = {a: [null, {c: 5}]};
    const path = 'a.1.c';
    const result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toEqual(5);

    const o2 = [null, {b: [null, 5]}]
    const path2 = '1.b.1';
    const result2 = getDirectPathValue({obj: o2, directPath: path2});
    expect(result2).toEqual(5);
  });

  it(`Should point well a direct nested object null property`, () => {
    let o = {a: {b: {c: null}}};
    const path = 'a.b.c';
    const result = getDirectPathValue({obj: o, directPath: path});
    expect(result).toBe(null);
  });

  it(`Should point well a not existent property, with custom and default default.`, () => {
    let o = {a: {b: {c: null}}};
    const path = 'a.b.j';
    const result = getDirectPathValue({obj: o, directPath: path, defaultReference: 'theDefault'});
    expect(result).toBe( 'theDefault');

    const path2 = 'a.b.j';
    const result2 = getDirectPathValue({obj: o, directPath: path});
    const d = getDefaultReference();
    expect(result2).toBe(d);
  });

  it(`Should return default if the path is deeper than the object`, () => {
    let o = {a: {b: {c: 4}}};
    const path = 'a.b.c.d';
    const result = getDirectPathValue({obj: o, directPath: path, defaultReference: 'theDefault'});
    expect(result).toBe('theDefault');
  });
});

//*
describe(`setDirectPathValue`, () => {
  
  it(`Should overwrite the deep object leaf if it exists.`, () => {
    let o = {a: {b: {c: 5}}};
    const path = 'a.b.c';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o.a.b.c).toEqual(6);
  });

  it(`Should create the deep object leaf if it doesn't exists.`, () => {
    let o = {a: {b: {c: 5}}};
    const path = 'a.b.d';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o.a.b.d).toEqual(6);
  });


  it(`Should overwrite the deep array leaf if it exists.`, () => {
    let o = [null, [null, [null, 5]]];
    let path = '1.1.1';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o[1][1][1]).toEqual(6);

    o = [null, [null, [null, 5]]];
    path = ['1', '1', '1'];
    let r = setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o[1][1][1]).toEqual(6);
    expect(r).toBe(true);
  });

  it(`Should handle well wrong paths..`, () => {
    let o = [null, [null, [null, 5]]];
    let path = '1.1.1.1';
    let r = setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(r).toEqual(false);
  });

  it(`Should create the deep array leaf if it exists.`, () => {
    let o = [null, [null, [null, 5]]];
    const path = '1.1.2';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o[1][1][2]).toEqual(6);
  });

  it(`Should overwrite well a direct property with array, and object mixed`, () => {
    const o = {a: [null, {c: 5}]};
    const path = 'a.1.c';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o.a[1].c).toEqual(6);

    const o2 = [null, {b: [null, 5]}]
    const path2 = '1.b.1';
    setDirectPathValue({obj: o2, directPath: path2, value: 7})
    expect(o2[1].b[1]).toEqual(7);
  });

  it(`Should handle well irrelevant '' in the path.`, () => {
    let o = [null, [null, [null, 5]]];
    let path = '..1...1...2';
    let r = setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(r).toEqual(true); expect(o[1][1][2]).toEqual(6);
  });

  it(`Should handle well, blank ('') properties`, () => {
    let o = {a: {'': {'': 5}}};
    const path = 'a."".""';
    setDirectPathValue({obj: o, directPath: path, value: 6});
    expect(o.a[""][""]).toEqual(6);
  })
});
//*/
//*
describe(`each`, () => { // some test are for be compatible with lodash each, in case be wanted to use lodash implementation.
  it(`Should return the collection no matters if isnt an array or object`, () => {
    let o = 5;
    let result = each(o);
    expect(result).toBe(5);
  });

  it(`Should return the collection no matters if isnt an array or object, including null.`, () => {
    let o = null;
    let result = each(o);
    expect(result).toBe(null);
  });


  it(`Should iterate an array elements, calling the fn with value, index, collection`, () => {
    let o = ['a', 'b', 'c'];
    let r = [];
    each(o, (v, i, c) => {
      r.push({v: v, i: i, c: c});
    })
    let x;
    x = r[0];
    expect(x.v).toBe('a'); expect(x.i).toBe(0); expect(x.c).toBe(o);
    x = r[1];
    expect(x.v).toBe('b'); expect(x.i).toBe(1); expect(x.c).toBe(o);
    x = r[2];
    expect(x.v).toBe('c'); expect(x.i).toBe(2); expect(x.c).toBe(o);
  });

  it(`Should iterate an object elements, calling the fn with value, key, collection`, () => {
    let o = {a: 11, b: 22, c: 33};
    let r = [];
    each(o, (v, i, c) => {
      r.push({v: v, i: i, c: c});
    })
    let x;
    x = r[0];
    expect(x.v).toBe(11); expect(x.i).toBe('a'); expect(x.c).toBe(o);
    x = r[1];
    expect(x.v).toBe(22); expect(x.i).toBe('b'); expect(x.c).toBe(o);
    x = r[2];
    expect(x.v).toBe(33); expect(x.i).toBe('c'); expect(x.c).toBe(o);
  });
});
//*/
//*
describe(`fanOut`, () => {//export function fanOut(obj, directPathChain, index = [], addBrokenPaths = false) {

  it(`Should spawn well a root array.`, () => {
    let obj = [{a: {b: [{name: 'p'}, {name: 'j'}]}}, {a: {b: [{name: 'x'}, {name: 'y'}]}}];
    const directPathChain = ['', 'a.b', 'name'];
    const r = fanOut({obj, directPathChain});
    expect(r.b).toBe(false);
    expect(r.i).toEqual([[0, [0, 1]], [1, [0, 1]]]);
    expect(r.v).toEqual(['p', 'j', 'x', 'y']);
  });

  it(`Should spawn well a root object.`, () => {
    let obj = {'o': {a: {b: [{name: 'p'}, {name: 'j'}]}}, 't': {a: {b: [{name: 'x'}, {name: 'y'}]}}};
    let directPathChain = ['', 'a.b', 'name'];
    let r = fanOut({obj, directPathChain});
    expect(r.i).toEqual([['o', [0, 1]], ['t', [0, 1]]]);
    expect(r.v).toEqual(['p', 'j', 'x', 'y']);
  });

  it(`Should spawn well a tail array.`, () => {
    let obj = {'o': {a: {b: [{name: ['p1', 'p2']}, {name: ['j1', 'j2']}]}},        't': {a: {b: [{name: ['x1', 'x2']}, {name: ['y1', 'y2']}]}}};

    const directPathChain = ['', 'a.b', 'name', ''];
    const r = fanOut({obj, directPathChain, addBrokenPaths: true});
    expect(r.i).toEqual([['o', [[0, [0, 1]], [1, [0, 1]]]], ['t', [[0, [0, 1]], [1, [0,1]]]]]);//, ['t', [[0, [0, 1]], [1, [0,1]]]]]]]);
    expect(r.v).toEqual(['p1', 'p2', 'j1', 'j2',  'x1', 'x2', 'y1', 'y2']);
  });

  it(`Should spawn well a tail object.`, () => {
    let obj = {'o': {a: {b: [{name: 'p', nick: 'n'}, {name: 'j', nick: 'm'}]}}};

    const directPathChain = ['o.a.b', '', ''];
    const r = fanOut({obj, directPathChain});
    //NOTE: actually should be done i[j] against v[j] checks, as weel as are all expected i[j]
    // cause the property orders could change in production use (deleted followed by recreation.)
    expect(r.i).toEqual([[0, ['name', 'nick']], [1, ['name', 'nick']]]);
    expect(r.v).toEqual(['p', 'n', 'j', 'm']);
  });
  
  it(`Should access well a deep collection items property.`, () => {
    const obj = getTestData();
    const directPathChain = ['results.0.intervals', 'intervalType'];
    const r = fanOut({obj, directPathChain});
    expect(r.i).toEqual([0, 1, 2]);
    expect(r.v).toEqual(['warmUp', 'middle', 'coolDown']);
  });

  it(`Should return broken flag true, empty values and indexes arrays when a path starts broken, when addBrokenPath is false.`, () => {
    const obj = getTestData();
    const directPathChain = ['results.j.intervals', 'intervalType'];
    const r = fanOut({obj, directPathChain});
    expect(r.b).toBe(true); expect(r.i).toEqual([]);
    expect(r.v).toEqual([]);
  });

  it(`Should return broken flag,empty values and indexes arrays when a broken path, when addBrokenPath is false.`, () => {
    const obj = getTestData();
    const directPathChain = ['results', 'intervalsz', 'intervalType'];
    const r = fanOut({obj, directPathChain, addBrokenPaths: false});
    expect(r.b).toEqual(true); expect(r.i).toEqual([]);  expect(r.v).toEqual([]);
  });

  it(`Should return default values and indexes array when a broken path, when addBrokenPath is true.`, () => {
    const obj = getTestData();
    const directPathChain = ['results', 'intervalsz', 'intervalType'];
    const r = fanOut({obj, directPathChain, addBrokenPaths: true});
    expect(r.b).toEqual(true);
    expect(r.i).toEqual([0, 1, 2]);
    expect(r.v).toEqual([getDefaultReference(), getDefaultReference(), getDefaultReference()]);
  });

  it(`Should return mixed values and indexes array when a broken path, when addBrokenPath is true.`, () => {
    const obj = getTestData();
    const directPathChain = ['results', 'intervals', 'intervalType'];
    const r = fanOut({obj, directPathChain, addBrokenPaths: true});
    expect(r.b).toEqual(true);
    expect(r.i).toEqual([[0, [0, 1, 2]], [1, [0, 1, 2, 3, 4, 5]], 2]);
    expect(r.v).toEqual([
      'warmUp', 'middle', 'coolDown'
      , 'warmUp', 'middle', 'middle', 'middle', 'middle', 'middle'
      , getDefaultReference()]);
  });

  it(`Should return empty values and indexes array when a broken path, when addBrokenPath is false.`, () => {
    const obj = getTestData();
    const directPathChain = ['results', 'intervals', 'intervalType'];
    const r = fanOut({obj, directPathChain, addBrokenPaths: false});
    expect(r.b).toEqual(true);
    expect(r.i).toEqual([]);
    expect(r.v).toEqual([]);
  });


  it(`Should works well with '' properties at beginning.`, () => {
    let obj = {'': {a: {b: [{name: 'p', nick: 'n'}, {name: 'j', nick: 'm'}]}}};
    const directPathChain = ['"".a.b', '', ''];
    let r = fanOut({obj, directPathChain});
    expect(r.i).toEqual([[0, ['name', 'nick']], [1, ['name', 'nick']]]);
    expect(r.v).toEqual(['p', 'n', 'j', 'm']);
  });
});
//*/
//*
describe(`extractOLeaves`, () => {  
  it(`Should work with simple direct paths.`, () => {
    const o = {a: [null, {b:5}]};
    let r;
    r = extractOLeaves({obj: o, directPathChain: 'a.1.b'}); 
    expect(r.d).toEqual(0); expect(r.p).toEqual(['a.1.b']);
    expect(r.i).toEqual([]); expect(r.v).toEqual([5]);
    expect(r.b).toBe(false);

    r = extractOLeaves({obj: o, directPathChain: 'a.1.c'});
    expect(r.d).toEqual(0); expect(r.p).toEqual(['a.1.c']);
    expect(r.i).toEqual([]); expect(r.v).toEqual([]);
    expect(r.b).toBe(true);

    r = extractOLeaves({obj: o, directPathChain: 'a.1.c', addBrokenPaths: true});
    expect(r.d).toEqual(0); expect(r.p).toEqual(['a.1.c']);
    expect(r.i).toEqual([]); expect(r.v).toEqual([getDefaultReference()]);
    expect(r.b).toBe(true);
  });

  it(`Should spawn well a root array.`, () => {
    let obj = [{a: {b: [{name: 'p'}, {name: 'j'}]}}, {a: {b: [{name: 'x'}, {name: 'y'}]}}];
    const fanOuts = ['', 'a.b', 'name'];
    const r = extractOLeaves({obj, directPathChain: '[].a.b[].name'});
    expect(r.d).toEqual(2); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([[0, [0, 1]], [1, [0, 1]]]); expect(r.v).toEqual(['p', 'j', 'x', 'y']);
  });

  it(`Should spawn well a root object.`, () => {
    let obj = {'o': {a: {b: [{name: 'p'}, {name: 'j'}]}}, 't': {a: {b: [{name: 'x'}, {name: 'y'}]}}};
    const fanOuts = ['', 'a.b', 'name'];
    const r = extractOLeaves({obj, directPathChain: '[].a.b[].name'});
    expect(r.d).toEqual(2); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([['o', [0, 1]], ['t', [0, 1]]]);
    expect(r.v).toEqual(['p', 'j', 'x', 'y']);
  });

  it(`Should spawn well a tail array.`, () => {
    let obj = {'o': {a: {b: [{name: ['p1', 'p2']}, {name: ['j1', 'j2']}]}}, 't': {a: {b: [{name: ['x1', 'x2']}, {name: ['y1', 'y2']}]}}};

    const fanOuts = ['', 'a.b', 'name', ''];
    const r = extractOLeaves({obj, directPathChain: '[].a.b[].name[]'});
    expect(r.d).toEqual(3); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([
      ['o', [[0, [0, 1]], [1, [0, 1]]]]
    , ['t', [[0, [0, 1]], [1, [0, 1]]]]
    ]);
    expect(r.v).toEqual(['p1', 'p2', 'j1', 'j2',  'x1', 'x2', 'y1', 'y2']);
  });

  it(`Should spawn well a tail object.`, () => {
    let obj = {'o': {a: {b: [{name: 'p', nick: 'n'}, {name: 'j', nick: 'm'}]}}};

    const fanOuts = ['o.a.b', '', ''];
    const r = extractOLeaves({obj, directPathChain: 'o.a.b[][]'});

    //NOTE: actually should be done i[j] against v[j] checks, as weel as are all expected i[j]
    // cause the property orders could change in production use (deleted followed by recreation.)
    expect(r.d).toEqual(2); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([
      [0, ['name', 'nick']], [1, ['name', 'nick']]
    ]);
    expect(r.v).toEqual(['p', 'n', 'j', 'm']);
  });

  it(`Should access well a deep collection items property.`, () => {
    const obj = getTestData();
    const fanOuts = ['results.0.intervals', 'intervalType'];
    const r = extractOLeaves({obj, directPathChain: 'results.0.intervals[].intervalType'});
    expect(r.d).toEqual(1); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([0, 1, 2]);
    expect(r.v).toEqual(['warmUp', 'middle', 'coolDown']);
    expect(r.b).toBe(false);
  });

  it(`Should return empty values and indexes array when a broken path, when addBrokenPath is false.`, () => {
    const obj = getTestData();
    const fanOuts = ['results.j.intervals', 'intervalType'];
    const r = extractOLeaves({obj, directPathChain: 'results.j.intervals[].intervalType'});

    expect(r.b).toBe(true);
    expect(r.d).toEqual(1); expect(r.p).toEqual(fanOuts);
    expect(r.i.length).toBe(0);   expect(r.v.length).toBe(0)
  });

  it(`Should return empty values and indexes array when a broken path, when addBrokenPath is true.`, () => {
    const obj = getTestData();
    const fanOuts = ['results', 'intervalsz', 'intervalType'];
    const r = extractOLeaves({obj, directPathChain: 'results[].intervalsz[].intervalType', addBrokenPaths: true});

    expect(r.b).toBe(true);
    expect(r.d).toEqual(2); expect(r.p).toEqual(fanOuts);
    expect(r.i).toEqual([0, 1, 2]);
    expect(r.v).toEqual([getDefaultReference(), getDefaultReference(), getDefaultReference()]);
  });
});
//*/
//*
describe(`fanIn`, () => {
  it(`Should work with simple direct paths.`, () => {
    let obj = {a: {b: 3}};
    let directPathChain = ['a.b'];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);
    let original = f.v[0];
    f.v[0] *= 2;
    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(true); expect(obj.a.b).toEqual(original * 2);

    obj = [[0, 9], [3, 8]];
    directPathChain = ['1.1'];
    f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);
    original = f.v[0];
    f.v[0] *= 2;
    ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(true); expect(obj[1][1]).toEqual(original * 2);
  });

  it(`Should work well iterating on root.`, () => {
    let obj = {a: {name: 'x'}, b: {name: 'y'}};
    let directPathChain = ['', 'name'];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);
    let originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');
    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(true);
    expect(obj.a.name).toEqual(originals[0] + 'j');
    expect(obj.b.name).toEqual(originals[1] + 'j');
    obj = [{name: 'x'}, {name: 'y'}];
    directPathChain = ['', 'name'];
    f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);
    originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');
    ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(true);
    expect(obj[0].name).toEqual(originals[0] + 'j');
    expect(obj[1].name).toEqual(originals[1] + 'j');
  });
  //*
  it(`Should work well iterating on tips.`, () => {
    let obj = {a: {name: ['x', 'y']}, b: {name: ['a', 'b', 'c']}};
    let directPathChain = ['b.name', ''];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);
    let originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');

    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});

    expect(ok).toBe(true);
    expect(obj.b.name[0]).toEqual(originals[0] + 'j');
    expect(obj.b.name[1]).toEqual(originals[1] + 'j');
    expect(obj.b.name[2]).toEqual(originals[2] + 'j');
  });

  it(`Should work well iterating in the middle.`, () => {
    ///////// for object
    let obj = {x: {a: {name: 'x'}, b: {name: 'y'}}};
    let directPathChain = ['x', 'name'];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);

    let originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');

    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});

    expect(ok).toBe(true);
    expect(obj.x.a.name).toEqual(originals[0] + 'j');
    expect(obj.x.b.name).toEqual(originals[1] + 'j');
    ///////// for array
    obj = {x: [{name: 'x'}, {name: 'y'}]};
    directPathChain = ['x', 'name'];
    f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);

    originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');

    ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});

    expect(ok).toBe(true);
    expect(obj.x[0].name).toEqual(originals[0] + 'j');
    expect(obj.x[1].name).toEqual(originals[1] + 'j');

  });

  it(`Should work well iterating multiple times.`, () => {
    let obj = {a: {b: [
      {
        x: {
          a: [0, {x: 'a', y: 'b'}]
          , b: [0, {x: 'c', y: 'd'}]
        }
      }
      , {
        x: {
          a: [0, {x: 'e', y: 'f'}]
          , b: [0, {x: 'g', y: 'h'}]
        }
      }
    ]}};
    let directPathChain = ['a.b', 'x', '1', ''];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(false);


    let originals = [...f.v];   
    f.v = f.v.map( e => e + 'j');

    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});

    expect(ok).toBe(true);
    expect(obj.a.b[0].x.a['1'].x).toEqual(originals[0] + 'j');
    expect(obj.a.b[0].x.a['1'].y).toEqual(originals[1] + 'j');
    expect(obj.a.b[0].x.b['1'].x).toEqual(originals[2] + 'j');
    expect(obj.a.b[0].x.b['1'].y).toEqual(originals[3] + 'j');
    expect(obj.a.b[1].x.a['1'].x).toEqual(originals[4] + 'j');
    expect(obj.a.b[1].x.a['1'].y).toEqual(originals[5] + 'j');
    expect(obj.a.b[1].x.b['1'].x).toEqual(originals[6] + 'j');
    expect(obj.a.b[1].x.b['1'].y).toEqual(originals[7] + 'j');
  });

  it(`Should return false`, () => {
    let obj = {a: [{b: 3}, {b: 5}]};
    let directPathChain = ['a[].b'];
    let f = fanOut({obj, directPathChain});
    expect(f.b).toBe(true);
    directPathChain = 'x[].b';
    let ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(false);

    obj = {a : 5}
    directPathChain = 'a[].b';
    ok = fanIn({obj, directPathChain, nestedIndexes: f.i, flatList: f.v});
    expect(ok).toBe(false);
  })
});
//*/
//*
describe(`injectOLeaves`, () => {
  let obj = {a: {b: [
    {
      x: {
        a: [0, {x: 'a', y: 'b'}]
        , b: [0, {x: 'c', y: 'd'}]
      }
    }
    , {
      x: {
        a: [0, {x: 'e', y: 'f'}]
        , b: [0, {x: 'g', y: 'h'}]
      }
    }
  ]}};
  let directPathChain = ['a.b', 'x', '1', ''];
  let processedOLeaves = extractOLeaves({obj, directPathChain});
  expect(processedOLeaves.b).toBe(false);


  let originals = [...processedOLeaves.v];   
  processedOLeaves.v = processedOLeaves.v.map( e => e + 'j');

  let ok = injectOLeaves({obj, processedOLeaves});

  expect(ok).toBe(true);
  expect(obj.a.b[0].x.a['1'].x).toEqual(originals[0] + 'j');
  expect(obj.a.b[0].x.a['1'].y).toEqual(originals[1] + 'j');
  expect(obj.a.b[0].x.b['1'].x).toEqual(originals[2] + 'j');
  expect(obj.a.b[0].x.b['1'].y).toEqual(originals[3] + 'j');
  expect(obj.a.b[1].x.a['1'].x).toEqual(originals[4] + 'j');
  expect(obj.a.b[1].x.a['1'].y).toEqual(originals[5] + 'j');
  expect(obj.a.b[1].x.b['1'].x).toEqual(originals[6] + 'j');
  expect(obj.a.b[1].x.b['1'].y).toEqual(originals[7] + 'j');
});
//*/
function getTestData () {
  return {
    "itemsPerPage": 250,
    "deepObj": {"a":8, "b":6, "c": 5},
    "totalResults": 3,
    "results": [
      {
        "workoutId": 10197051700,
        "scheduledWorkoutId": 10197051700,
        "workoutType": "plan",
        "scheduledDate": "2017-10-07T00:00:00",
        "workoutName": "FINALIZAR MÁS RÁPIDO - 1/2 MARATÓNZ",
        "training": {
          "href": "https://micoach.adidas.com/api/v3/content/trainings/workouts/60003288248?lang=ar",
          "mediaType": "application/vnd.micoach+cardioPlanComponent+v1+json",
          "id": 60003288248
        },
        "plan": {
          "href": "https://micoach.adidas.com/api/v3/Users/8511104/plans/100004375493?lang=ar",
          "mediaType": "application/vnd.micoach+userCardioPlan+v1+json",
          "id": 100004375493
        },
        "order": 3,
        "recommendedTime": 1800,
        "intervals": [
          {
            "intervalType": "warmUp",
            "totalTimeInZone": 300,
            "miCoachZone": "blue"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 1200,
            "miCoachZone": "green"
          },
          {
            "intervalType": "coolDown",
            "totalTimeInZone": 300,
            "miCoachZone": "blue"
          }
        ],
        "trainingNotes": {
          "noteSummary": "Carrera verde.",
          "note": "Calienta y haz un poco de footing sencillo, y después acelera hasta alcanzar la velocidad de tu zona verde.",
          "secondaryNote": "Prepara tu equipo para el día de la carrera: las mismas zapatillas y ropa, todo el buen equipo con el que te has ejercitado. Nada nuevo. ¡Disfruta!. ¡BUENA SUERTE!"
        }
      },
      {
        "workoutId": 10197051699,
        "scheduledWorkoutId": 10197051699,
        "workoutType": "plan",
        "scheduledDate": "2017-10-05T00:00:00",
        "workoutName": "FINALIZAR MÁS RÁPIDO - 1/2 MARATÓN",
        "training": {
          "href": "https://micoach.adidas.com/api/v3/content/trainings/workouts/60003288247?lang=ar",
          "mediaType": "application/vnd.micoach+cardioPlanComponent+v1+json",
          "id": 60003288247
        },
        "plan": {
          "href": "https://micoach.adidas.com/api/v3/Users/8511104/plans/100004375493?lang=ar",
          "mediaType": "application/vnd.micoach+userCardioPlan+v1+json",
          "id": 100004375493
        },
        "order": 2,
        "recommendedTime": 1800,
        "intervals": [
          {
            "intervalType": "warmUp",
            "totalTimeInZone": 300,
            "miCoachZone": "blue"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 60,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 60,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 60,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 60,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 60,
            "miCoachZone": "green"
          }
          
        ],
        "trainingNotes": {
          "noteSummary": "Intervalos en la zona amarilla Fartlek.",
          "note": "Estas zonas amarillas se corren a tu ritmo de carrera de 5 km.",
          "secondaryNote": "Corre rápido en cada zona amarilla pero no te pares para recuperarte en la verde. Sigue corriendo aunque necesites reducir el ritmo hasta hacer footing."
        }
      },
      {
        "workoutId": 10197051698,
        "scheduledWorkoutId": 10197051698,
        "workoutType": "plan",
        "scheduledDate": "2017-10-03T00:00:00",
        "workoutName": "FINALIZAR MÁS RÁPIDO - 1/2 MARATÓN",
        "training": {
          "href": "https://micoach.adidas.com/api/v3/content/trainings/workouts/60003288246?lang=ar",
          "mediaType": "application/vnd.micoach+cardioPlanComponent+v1+json",
          "id": 60003288246
        },
        "plan": {
          "href": "https://micoach.adidas.com/api/v3/Users/8511104/plans/100004375493?lang=ar",
          "mediaType": "application/vnd.micoach+userCardioPlan+v1+json",
          "id": 100004375493
        },
        "order": 1,
        "recommendedTime": 1920,
        "intervalsZZZ": [
          {
            "intervalType": "warmUp",
            "totalTimeInZone": 300,
            "miCoachZone": "blue"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 90,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 240,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 90,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 240,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 90,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 240,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 90,
            "miCoachZone": "green"
          },
          {
            "intervalType": "middle",
            "totalTimeInZone": 240,
            "miCoachZone": "yellow"
          },
          {
            "intervalType": "coolDown",
            "totalTimeInZone": 300,
            "miCoachZone": "blue"
          }
        ],
        "trainingNotes": {
          "noteSummary": "Intervalos de ritmo controlado en la zona amarilla.",
          "note": "Corre cada zona amarilla a tu ritmo de carrera de entre 8 y 12 km.",
          "secondaryNote": "Permanece en las zonas. Corre intensamente en cada zona amarilla y utiliza las zonas verdes para recuperarte. Este entrenamiento será duro; realiza una serie cada vez."
        }
      }
    ]
  };
  }
