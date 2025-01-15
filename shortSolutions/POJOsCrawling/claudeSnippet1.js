function processPojoWithPaths(pojo, paths) {
  const result = {};
  
  // Process each path
  paths.forEach(path => {
    if (!path.includes('[].')) {
      // Handle root level property
      result[path] = {
        d: 0,
        v: pojo[path]
      };
    } else {
      // Handle nested paths
      result[path] = processNestedPath(pojo, path);
    }
  });
  
  return result;
}

function processNestedPath(obj, path) {
  const segments = path.split('[].');
  let current = obj;
  let depth = segments.length - 1; // Number of array levels
  let result = [];
  
  // Function to process nested arrays recursively
  function processLevel(currentObj, segmentIndex, indices = []) {
    const segment = segments[segmentIndex];
    
    if (!Array.isArray(currentObj)) {
      // Navigate to next property if not an array
      currentObj = currentObj[segment.split('[].')[0]];
    }
    
    if (!currentObj) return;
    
    if (segmentIndex === segments.length - 1) {
      // We're at the final property
      if (Array.isArray(currentObj)) {
        currentObj.forEach((item, idx) => {
          result.push({
            d: depth,
            ...indices.reduce((acc, val, index) => {
              acc[String.fromCharCode(105 + index)] = val;
              return acc;
            }, {}),
            [String.fromCharCode(105 + indices.length)]: idx,
            v: item[segment]
          });
        });
      } else {
        result.push({
          d: depth,
          ...indices.reduce((acc, val, index) => {
            acc[String.fromCharCode(105 + index)] = val;
            return acc;
          }, {}),
          v: currentObj[segment]
        });
      }
    } else {
      // We need to go deeper
      if (Array.isArray(currentObj)) {
        currentObj.forEach((item, idx) => {
          processLevel(item, segmentIndex + 1, [...indices, idx]);
        });
      } else {
        processLevel(currentObj, segmentIndex + 1, indices);
      }
    }
  }
  
  processLevel(current, 0);
  return result;
}

// Example usage:
const testPojo = {
  title: "Main Title",
  items: [
    {
      description: "First desc",
      subItems: [
        { name: "Sub1.1" },
        { name: "Sub1.2" }
      ]
    },
    {
      description: "Second desc",
      subItems: [
        { name: "Sub2.1" },
        { name: "Sub2.2" }
      ]
    }
  ]
};

const paths = [
  "title",
  "items[].description",
  "items[].subItems[].name"
];

const result = processPojoWithPaths(testPojo, paths);
console.log(JSON.stringify(result, null, 2));