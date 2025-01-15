// pojo-processor.test.js (or a similarly named test file)
const { processPojoWithPaths } = require('./pojo-processor'); // Adjust path as needed
const { reconstructFromPaths } = require('./pojo-reconstructor'); // Adjust path as needed

describe('POJO Processing and Reconstruction', () => {
  it('Test 1: Simple root level property', () => {
    const input = { title: "Hello World" };
    const paths = ["title"];
    const result = processPojoWithPaths(input, paths);
    expect(result).toEqual({ title: { d: 0, v: "Hello World" } });
    const reconstructed = reconstructFromPaths(result);
    expect(reconstructed).toEqual({ title: "Hello World" });
  });

  it('Test 2: Single level array', () => {
    const input = { items: [{ name: "First" }, { name: "Second" }] };
    const paths = ["items[].name"];
    const result = processPojoWithPaths(input, paths);
    expect(result).toEqual({
      "items[].name": [
        { d: 1, i: 0, v: "First" },
        { d: 1, i: 1, v: "Second" }
      ]
    });
    const reconstructed = reconstructFromPaths(result);
    expect(reconstructed).toEqual({
      items: [{ name: "First" }, { name: "Second" }]
    });
  });

  it('Test 3: Nested arrays', () => {
    const input = {
      categories: [
        { name: "Category 1", items: [{ id: "1.1" }, { id: "1.2" }] },
        { name: "Category 2", items: [{ id: "2.1" }, { id: "2.2" }] }
      ]
    };
    const paths = ["categories[].name", "categories[].items[].id"];
    const result = processPojoWithPaths(input, paths);
    expect(result).toEqual({
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
    const reconstructed = reconstructFromPaths(result);
    expect(reconstructed).toEqual(input);
  });

  it('Test 4: Mixed properties (root and nested)', () => {
    // ... (rest of your test cases - follow the same pattern)
    const input = {
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
      const paths = ["title", "description", "sections[].subtitle", "sections[].items[].name"];
      const result = processPojoWithPaths(input, paths);
      expect(result).toEqual({
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
      const reconstructed = reconstructFromPaths(result);
      expect(reconstructed).toEqual(input);
  });

  it('Test 5: Empty arrays', () => {
    const input = { items: [] };
    const paths = ["items[].name"];
    const result = processPojoWithPaths(input, paths);
    expect(result).toEqual({ "items[].name": [] });
    const reconstructed = reconstructFromPaths(result);
    expect(reconstructed).toEqual({ items: [] });
  });

  it('Test 6: Deeply nested structure', () => {
    const input = {
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
      const paths = ["level1[].level2[].level3[].value"];
      const result = processPojoWithPaths(input, paths);
      expect(result).toEqual({
        "level1[].level2[].level3[].value": [
          { d: 3, i: 0, j: 0, k: 0, v: "1.1.1" },
          { d: 3, i: 0, j: 0, k: 1, v: "1.1.2" }
        ]
      });
      const reconstructed = reconstructFromPaths(result);
      expect(reconstructed).toEqual(input);
  });
});