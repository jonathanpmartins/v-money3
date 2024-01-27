const tsPreset = require('ts-jest/jest-preset');
const puppeteerPreset = require('jest-puppeteer/jest-preset');

module.exports = {
  ...tsPreset,
  ...puppeteerPreset,
  globals: {},
  testTimeout: 60000,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  modulePaths: [
    '<rootDir>',
  ],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
