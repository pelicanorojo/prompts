/*
 * @Author: Pablo Benito <pelicanorojo> bioingbenito@gmail.com
 * @Date: 2024-12-21T12:37:39-03:00
 * @Last modified by: Pablo Benito <pelicanorojo>
 * @Last modified time: 2025-01-15T01:25:31-03:00
 */


/*
For directPahValue and each I could use lodash functions get and each respectively.
But I prefer to use my own slim implementation by, now,
but could be replaced if you wants :).
*/
/*
function isPositiveIntegerWithoutLeadingZeros(str) { // from Gemini 2.0 Flash Experimental
  return /^(0|[1-9][0-9]*)$/.test(str);
}
//*/
// for mark broken paths, and missing values, instead of undefined, which could be an actual value.
const _defaultReference = {};
export const getDefaultReference = () => _defaultReference;

export const getDirectPathValue = ({obj, directPath, defaultReference = _defaultReference}) => {
  // For acces '' properties do: 'a."".b' for instance, or ['""', 'b'] === '""[].b'
  // and the actual '' as parth of the path, stay in the position.
  // paths should have the shape aaaa.bbbb.cccc.dddd or be an array, in case the ssss needs to have special chars, like dot for instance.
  // a path [], '' or [''] return the obj itself.
  // and paths like a.b...c.x.....y... collapses the multiple dots to one dot.
  // So '....' or ['', '', ''] should return obj
  // If isnt found the deep property, is returned defaultReference
  const path = Array.isArray(directPath)? directPath : directPath.split('.');  
  const pathL = path.length;
  let r = obj;

  for(let i = 0; i < pathL; i++) {
    let step = path.shift();
  
    if (typeof step !== 'string') {
      r = defaultReference;
      break;
    }

    if (step === '') {continue;}
    if (step === '""') {step = '';}
    
    if (typeof r !== 'object' || r === null) {
      r = defaultReference;
      break;
    }

    r = step in r
      ? r[step]
      : defaultReference;
  }

  return r;
}

export const setDirectPathValue = ({obj, directPath, value}) => {
  // paths should have the shape aaaa.bbbb.cccc.dddd or be an array, in case the ssss needs to have special chars, like dot for instance.
  // and paths like a.b...c.x.....y are reduced to a.b.c.x.y
  // and paths like a.b...c.x.....y... are reduced to a.b.c.x.y
  // The result is true, if the set was possible, and false in case of failure.
  // If the deep object to which a property will be updated isnt an obj, or is defaultReference, the process fails.
  // If on direct path, the property to update isn't specified as a string, will fail.
  // If the property to update don't exists, don't matters, will be created.
  const path = Array.isArray(directPath)? directPath : directPath.split('.');
  const leafPropName = path.pop();
  
  const _obj = getDirectPathValue({obj, directPath: path, defaultReference: _defaultReference});
  const result = typeof leafPropName === 'string' && typeof _obj === 'object' && _obj !== null && _obj !== _defaultReference;

  if (result) {
    _obj[leafPropName === '""' ? '' : leafPropName] = value;
  }

  return result;
}

// iterates over an array or an object, calling the fn, with (value, index/key, collection)
// returns the collection for be chain friendly
export const each = (a, fn) => {
  if ( Array.isArray(a)) {
    a.forEach(fn);
  } else if (typeof a === 'object' && a !== null) {
    let entries = Object.entries(a);
    entries.forEach(([k, v], i, c) => fn(v, k, a));
  }

  return a;
}

// fanOut is more an internal tool.
export function fanOut({obj, directPathChain, addBrokenPaths = false}) {
  // addBrokenPaths, is a debug thing, which could be used for prod too if is found some other use case.
  // but in general a flag r.b === true should does to ignore the result, except for debugging purpose.
  // result has the correlated indexes and values array i[n] is the index matrix for v[n]
  // The result has this shape: {i:[], v:[], b: boolean}
  // Where i, is a nested indexes array, v is a plain array with the found values, and b, is flag saying if some path was broken.
  // i has shapes like: [[0, ['a', 'b]], [1, ['c', 'd]]] where 0 and 1, are indexes/keys of first fanOut point in the path,
  //    and 'a', 'b', 'c', and 'd' are indexes/keys of second fanOut point, the last in this example.
  // result initialization.
  let r = {i: [], v:[]};
  // a directPath, is a path from the begining to a fanOut.
  let [directPath, ..._directPathChain] = directPathChain;

  // directpaths equal to '' or undefined, stay in the place
  let directValue = directPath ? getDirectPathValue({obj, directPath, defaultReference: _defaultReference}) : obj;

  // recursion end cause a leaf
  if ( _directPathChain.length === 0) {
    r.b = directValue === _defaultReference; //broken leaf
    if ((!r.b || addBrokenPaths)) {
      r.v.push(directValue);
    }
  }
  // recursion end cause broken path
  // we are here cause _directPathChain.length > 0 so next conditions means broken path
  else if (typeof directValue === undefined || directValue === null || typeof directValue !== 'object' || directValue === _defaultReference) {
    r.b = true; // broken fanOut
    if (addBrokenPaths) {
      r.v.push(_defaultReference);
    }
  }
  // recursion spread for arrays and objects
  else {
    let withBrokenPaths = false;
    each(directValue, (o, i) => {// note near tips, could be formated a collection with some broken paths, and some ok paths
      // but if this result is used in a parent collection, cause the b flag, will be discarded complete.
      // so for have the same behabiour despite deep, a collection with a mix of b true/false, is forced to return []
      
      // way for preserve order, maybe need performance enhancement
      let _r = fanOut({obj: o, directPathChain: _directPathChain, addBrokenPaths});

      // if not broken paths, or add broken paths
      if (!_r.b || addBrokenPaths) {
        _r.v.splice(0, 0, ...r.v); // left r values are left at the beginning 
        r.v = _r.v;
        //_r.i can be undefined cause v has leaf value, or  cause was found a broken path
        r.i.push(_r.i.length ? [i, _r.i] : i ); //[0, [1, [0, 1]], 2, 3] // [[0, [0, 1]], [1, [0, 1]]] // [[0, [0, 1]], [1]]
      }

      withBrokenPaths ||= _r.b;
    });
    r.b = withBrokenPaths;
    if (r.b && !addBrokenPaths) {
      r.i = []; r.v = [];//clear
    }
  }

  return r;
}

// extractOLeaves is the function for be published.
export function extractOLeaves({obj, directPathChain, addBrokenPaths = false}) {
  // The why of this format is for when content needs to be processed, transformed, with a linear array as input.
  // But in a reversible way (here the nested indexes array.)
  // Direct path chain can be a string, like 'a.1[].b[].c' or the equivalent array ['a.1', 'b', 'c]
  //
  let _directPathChain = Array.isArray(directPathChain) ? directPathChain : directPathChain.split(/\[\]\.?/);
  let r = fanOut({obj, directPathChain: _directPathChain, addBrokenPaths});

  return {
    d: _directPathChain.length - 1, // deep
    p: _directPathChain, // pathChain
    i: r.i, // nested indexes array
    v: r.v, // flat values array: These values are the ones for be transformed.
    b: r.b // there were broken paths.
  };
}

//*
export function fanIn({obj, directPathChain, nestedIndexes, flatList}) {
  // directpathChain enables follow the path to the points where fanOut take place,
  //  there are used the nestedIndexes first level values.
  let [directPath, ..._directPathChain] = directPathChain;
  let ok;

  // recursion end cause a leaf
  if ( _directPathChain.length === 0) {
    ok = setDirectPathValue({obj, directPath, value: flatList.shift()});
  }
  // recursion spread for arrays and objects nestedIndexes: [[0, [0, 1, 2, 3]], [1, [0, 1, 2]]]
  else {
    let fanOutObject = getDirectPathValue({obj, directPath, defaultReference: _defaultReference});
    ok = fanOutObject !== _defaultReference && typeof fanOutObject === 'object';

    if (ok) {
      // onTipFanOut is a special condition, we acts on tip collection processing the tip collection values itself, instead of a tip collection values property.
      let onTipFanOut = _directPathChain.length === 1 && _directPathChain[0] === '';

      nestedIndexes.forEach( _indexes => {// elements of: [0, 1] vs [[0, [0,1]], [1, [0,1,2]]]
        // last levels, instead of be [[0], [1], ...] are [0, 1, ...] for less array levels.
        let isLastLevel = !Array.isArray(_indexes); // we get 1 for instance o 'a', and not [0, [0, 1]] or ['a', [0, 1]].

        let key = isLastLevel ? _indexes : _indexes.shift(); // Cause how last levels are, differ how we get the key
        let nestedObject = onTipFanOut ? fanOutObject : fanOutObject[key]; // If the path chain, ends with [''], means we want to modify all

        let indexes = isLastLevel ? undefined : _indexes.shift(); // when no last level of fanOut, we expect get next indexes this way.

        // in case of onTipFanOut, we call fanIn with the same object, and construct the directPath with the keys
        let __directPathChain = onTipFanOut ? [String(key)] : _directPathChain;
      
        ok &&= fanIn({
          obj: nestedObject,
          directPathChain: __directPathChain,
          nestedIndexes: indexes,
          flatList
        });
      });
    }
  }
  return ok;
}
//*/


export function injectOLeaves({obj, processedOLeaves}) {
  return fanIn({obj, directPathChain: processedOLeaves.p, nestedIndexes: processedOLeaves.i, flatList: processedOLeaves.v});
}
