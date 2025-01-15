const assert = require('assert').strict;

// Import the functions (assuming they're in separate files)
// const { processPojoWithPaths } = require('./pojo-processor');
// const { reconstructFromPaths } = require('./pojo-reconstructor');

// Test Cases
function runTests() {
  console.log('Starting tests...\n');
  
  // Test 1: Simple root level property
  console.log('Test 1: Simple root level property');
  const test1Input = {
    title: "Hello World"
  };
  const test1Paths = ["title"];
  
  const test1Result = processPojoWithPaths(test1Input, test1Paths);
  assert.deepStrictEqual(test1Result, {
    "title": { d: 0, v: "Hello World" }
  });
  console.log('✓ Processor test passed');
  
  const test1Reconstructed = reconstructFromPaths(test1Result);
  assert.deepStrictEqual(test1Reconstructed, { title: "Hello World" });
  console.log('✓ Reconstructor test passed\n');

  // Test 2: Single level array
  console.log('Test 2: Single level array');
  const test2Input = {
    items: [
      { name: "First" },
      { name: "Second" }
    ]
  };
  const test2Paths = ["items[].name"];
  
  const test2Result = processPojoWithPaths(test2Input, test2Paths);
  assert.deepStrictEqual(test2Result, {
    "items[].name": [
      { d: 1, i: 0, v: "First" },
      { d: 1, i: 1, v: "Second" }
    ]
  });
  console.log('✓ Processor test passed');
  
  const test2Reconstructed = reconstructFromPaths(test2Result);
  assert.deepStrictEqual(test2Reconstructed, {
    items: [
      { name: "First" },
      { name: "Second" }
    ]
  });
  console.log('✓ Reconstructor test passed\n');

  // Test 3: Nested arrays
  console.log('Test 3: Nested arrays');
  const test3Input = {
    categories: [
      {
        name: "Category 1",
        items: [
          { id: "1.1" },
          { id: "1.2" }
        ]
      },
      {
        name: "Category 2",
        items: [
          { id: "2.1" },
          { id: "2.2" }
        ]
      }
    ]
  };
  const test3Paths = ["categories[].name", "categories[].items[].id"];
  
  const test3Result = processPojoWithPaths(test3Input, test3Paths);
  assert.deepStrictEqual(test3Result, {
    "categories[].name": [
      { d: 1, i: 0, v: "Category 1" },
      { d: 1, i: 1, v: "Category 2" }
    ],
    "categories[].items[].id": [
      { d: 2, i: 0, j: 0, v: "1.1" },
      { d: 2, i: 0, j: 1, v: "1.2" },
      { d: 2, i: 1, j: 0, v: "2.1" },
      { d: 2, i: 1, j: 1, v: "2.2" }
    ]
  });
  console.log('✓ Processor test passed');
  
  const test3Reconstructed = reconstructFromPaths(test3Result);
  assert.deepStrictEqual(test3Reconstructed, test3Input);
  console.log('✓ Reconstructor test passed\n');

  // Test 4: Mixed properties (root and nested)
  console.log('Test 4: Mixed properties');
  const test4Input = {
    title: "Main Title",
    description: "Main Description",
    sections: [
      {
        subtitle: "Section 1",
        items: [{ name: "Item 1.1" }]
      },
      {
        subtitle: "Section 2",
        items: [{ name: "Item 2.1" }]
      }
    ]
  };
  const test4Paths = ["title", "description", "sections[].subtitle", "sections[].items[].name"];
  
  const test4Result = processPojoWithPaths(test4Input, test4Paths);
  assert.deepStrictEqual(test4Result, {
    "title": { d: 0, v: "Main Title" },
    "description": { d: 0, v: "Main Description" },
    "sections[].subtitle": [
      { d: 1, i: 0, v: "Section 1" },
      { d: 1, i: 1, v: "Section 2" }
    ],
    "sections[].items[].name": [
      { d: 2, i: 0, j: 0, v: "Item 1.1" },
      { d: 2, i: 1, j: 0, v: "Item 2.1" }
    ]
  });
  console.log('✓ Processor test passed');
  
  const test4Reconstructed = reconstructFromPaths(test4Result);
  assert.deepStrictEqual(test4Reconstructed, test4Input);
  console.log('✓ Reconstructor test passed\n');

  // Test 5: Empty arrays
  console.log('Test 5: Empty arrays');
  const test5Input = {
    items: []
  };
  const test5Paths = ["items[].name"];
  
  const test5Result = processPojoWithPaths(test5Input, test5Paths);
  assert.deepStrictEqual(test5Result, {
    "items[].name": []
  });
  console.log('✓ Processor test passed');
  
  const test5Reconstructed = reconstructFromPaths(test5Result);
  assert.deepStrictEqual(test5Reconstructed, { items: [] });
  console.log('✓ Reconstructor test passed\n');

  // Test 6: Deeply nested structure
  console.log('Test 6: Deeply nested structure');
  const test6Input = {
    level1: [
      {
        level2: [
          {
            level3: [
              { value: "1.1.1" },
              { value: "1.1.2" }
            ]
          }
        ]
      }
    ]
  };
  const test6Paths = ["level1[].level2[].level3[].value"];
  
  const test6Result = processPojoWithPaths(test6Input, test6Paths);
  assert.deepStrictEqual(test6Result, {
    "level1[].level2[].level3[].value": [
      { d: 3, i: 0, j: 0, k: 0, v: "1.1.1" },
      { d: 3, i: 0, j: 0, k: 1, v: "1.1.2" }
    ]
  });
  console.log('✓ Processor test passed');
  
  const test6Reconstructed = reconstructFromPaths(test6Result);
  assert.deepStrictEqual(test6Reconstructed, test6Input);
  console.log('✓ Reconstructor test passed\n');

  console.log('All tests passed successfully! 🎉');
}

// Run the tests
try {
  runTests();
} catch (error) {
  console.error('Test failed:', error);
  process.exit(1);
}