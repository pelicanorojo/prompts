// jest.config.js
export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "mjs"],

  // Transform files with babel-jest
  transform: {
    "^.+\\.js$": "babel-jest"
  },

  // The root directory that Jest should scan for tests and modules
  roots: ["<rootDir>/__tests__"],

  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/$1', // Map @root to the project root
    '^@src/(.*)$': '<rootDir>/src/$1' // Map @src to the src folder
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage"
}