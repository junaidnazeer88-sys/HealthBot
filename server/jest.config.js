// server/jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterFramework: ["<rootDir>/__tests__/setup.js"],
  testTimeout: 15000, // 15s — MongoDB ops can be slow
  verbose: true,
  forceExit: true, // force exit after all tests done
  clearMocks: true,
};
