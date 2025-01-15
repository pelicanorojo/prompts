function reconstructFromPaths(flattenedData) {
  const result = {};

  // Process each path
  Object.entries(flattenedData).forEach(([path, data]) => {
    if (!Array.isArray(data)) {
      // Handle root level properties
      if (data.d === 0) {
        result[path] = data.v;
      }
    } else {
      // Handle nested paths
      reconstructNestedPath(result, path, data);
    }
  });

  return result;
}

function reconstructNestedPath(obj, path, data) {
  const segments = path.split('[].');
  
  // For each flattened item, reconstruct its path
  data.forEach(item => {
    let current = obj;
    
    // Navigate through segments
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const indexKey = String.fromCharCode(105 + i); // 'i', 'j', 'k', etc.
      const arrayIndex = item[indexKey];
      
      // Ensure path exists
      if (!current[segment]) {
        current[segment] = [];
      }
      
      // Ensure array element exists
      if (!current[segment][arrayIndex]) {
        current[segment][arrayIndex] = {};
      }
      
      current = current[segment][arrayIndex];
    }
    
    // Set the final value
    const lastSegment = segments[segments.length - 1];
    current[lastSegment] = item.v;
  });
}

// Example usage:
const flattenedData = {
  "title": {
    "d": 0,
    "v": "Main Title"
  },
  "items[].description": [
    {
      "d": 1,
      "i": 0,
      "v": "First desc"
    },
    {
      "d": 1,
      "i": 1,
      "v": "Second desc"
    }
  ],
  "items[].subItems[].name": [
    {
      "d": 2,
      "i": 0,
      "j": 0,
      "v": "Sub1.1"
    },
    {
      "d": 2,
      "i": 0,
      "j": 1,
      "v": "Sub1.2"
    },
    {
      "d": 2,
      "i": 1,
      "j": 0,
      "v": "Sub2.1"
    },
    {
      "d": 2,
      "i": 1,
      "j": 1,
      "v": "Sub2.2"
    }
  ]
};

// Test the reconstruction
const reconstructed = reconstructFromPaths(flattenedData);
console.log(JSON.stringify(reconstructed, null, 2));

// Utility function to verify all paths exist in reconstructed object
function verifyPaths(obj, paths) {
  const results = {};
  
  paths.forEach(path => {
    const segments = path.split('[].');
    let current = obj;
    let exists = true;
    
    for (const segment of segments) {
      if (Array.isArray(current)) {
        current = current.map(item => item[segment]);
        current = current.flat();
      } else {
        current = current[segment];
      }
      
      if (current === undefined) {
        exists = false;
        break;
      }
    }
    
    results[path] = {
      exists,
      value: current
    };
  });
  
  return results;
}

// Test paths
const paths = [
  "title",
  "items[].description",
  "items[].subItems[].name"
];

const verification = verifyPaths(reconstructed, paths);
console.log('\nPath Verification:', JSON.stringify(verification, null, 2));