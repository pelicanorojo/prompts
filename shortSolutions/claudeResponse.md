I'll create a Node.js script that handles JSON translation with the Google Cloud Translation API, supporting both root-level and deep nested array properties.



```javascript
const { TranslationServiceClient } = require('@google-cloud/translate');
const fs = require('fs').promises;
const path = require('path');

// Function to get nested property value using path string
const getNestedValue = (obj, path) => {
  const parts = path.split('[].');
  let current = obj;
  
  for (const part of parts) {
    if (part.includes('[].')) {
      // We're dealing with an array of arrays
      current = current.flatMap(item => item[part.split('[].')[0]]);
    } else if (Array.isArray(current)) {
      // We're dealing with an array of objects
      current = current.map(item => item[part]);
    } else {
      current = current[part];
    }
  }
  
  return current;
};

// Function to set nested property value using path string
const setNestedValue = (obj, path, value) => {
  const parts = path.split('[].');
  let current = obj;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      // Last part, set the value
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          item[part] = value[index];
        });
      } else {
        current[part] = value;
      }
    } else {
      if (part.includes('[].')) {
        // We're dealing with an array of arrays
        const arrayProp = part.split('[].')[0];
        current = current.flatMap(item => item[arrayProp]);
      } else if (Array.isArray(current)) {
        // We're dealing with an array of objects
        current = current.map(item => item[part]);
      } else {
        current = current[part];
      }
    }
  }
};

async function translateJson(inputFile, outputFile, targetLanguage, propertiesToTranslate) {
  try {
    // Initialize the translation client
    const translationClient = new TranslationServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = 'global';

    // Read and parse input JSON
    const jsonContent = await fs.readFile(inputFile, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    
    // Create a deep copy for modification
    const translatedJson = JSON.parse(JSON.stringify(jsonData));

    // Process each property to translate
    for (const prop of propertiesToTranslate) {
      // Get the value to translate
      const valueToTranslate = getNestedValue(jsonData, prop);
      
      if (!valueToTranslate) {
        console.warn(`Warning: Property ${prop} not found in JSON`);
        continue;
      }

      let textsToTranslate = [];
      if (Array.isArray(valueToTranslate)) {
        textsToTranslate = valueToTranslate.flat();
      } else {
        textsToTranslate = [valueToTranslate];
      }

      // Filter out non-string values and empty strings
      textsToTranslate = textsToTranslate.filter(text => 
        typeof text === 'string' && text.trim().length > 0
      );

      if (textsToTranslate.length === 0) {
        console.warn(`Warning: No valid text to translate for property ${prop}`);
        continue;
      }

      // Prepare the request
      const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: textsToTranslate,
        mimeType: 'text/plain',
        sourceLanguageCode: 'auto',
        targetLanguageCode: targetLanguage,
      };

      // Perform translation
      const [response] = await translationClient.translateText(request);
      const translations = response.translations.map(t => t.translatedText);

      // Update the translated JSON with new values
      setNestedValue(translatedJson, prop, 
        Array.isArray(valueToTranslate) ? translations : translations[0]
      );
    }

    // Write the translated JSON to output file
    await fs.writeFile(
      outputFile,
      JSON.stringify(translatedJson, null, 2),
      'utf8'
    );

    console.log(`Translation completed successfully. Output saved to ${outputFile}`);
  } catch (error) {
    console.error('Translation error:', error);
    process.exit(1);
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log(`
Usage: node translate-json.js <inputFile> <outputFile> <targetLanguage> <propertiesToTranslate>

Example: 
node translate-json.js 
  input.json 
  output.json 
  en 
  '["title","items[].description","items[].subItems[].name"]'
  `);
  process.exit(1);
}

const [inputFile, outputFile, targetLanguage, propsJson] = args;
const propertiesToTranslate = JSON.parse(propsJson);

// Execute translation
translateJson(inputFile, outputFile, targetLanguage, propertiesToTranslate);

```

To use this script:

1. First, install the required dependency:
```bash
npm install @google-cloud/translate
```

2. Set up Google Cloud credentials:
   - Create a Google Cloud project
   - Enable the Cloud Translation API
   - Create a service account and download the JSON key
   - Set the environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
     export GOOGLE_CLOUD_PROJECT="your-project-id"
     ```

3. Run the script:
```bash
node translate-json.js input.json output.json en '["title","descriptions[].text","items[].subItems[].name"]'
```

The script supports:
- Root level properties
- Array properties using the `[]` notation
- Nested array properties
- Multiple levels of nesting

Example input JSON:
```json
{
  "title": "Hola mundo",
  "descriptions": [
    { "text": "primer texto" },
    { "text": "segundo texto" }
  ],
  "items": [
    {
      "subItems": [
        { "name": "elemento uno" },
        { "name": "elemento dos" }
      ]
    }
  ]
}
```

Properties to translate:
```json
[
  "title",
  "descriptions[].text",
  "items[].subItems[].name"
]
```

Would you like me to explain any part of the implementation or add any additional features?
