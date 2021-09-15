module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
  },
  extends: [
    // 'plugin:vue/base',
    'plugin:vue/vue3-essential',
    'airbnb-base',
    // 'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  // parser: '@typescript-eslint/parser',
  parserOptions: {
    // parser: 'vue-eslint-parser',
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'vue',
    // '@typescript-eslint',
  ],
  rules: {
    'no-param-reassign': 'off',
    'no-nested-ternary': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-undef': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-console': 'off',
    // '@typescript-eslint/rule-name': 'error',
  },
  ignorePatterns: ['/dist/**', '/node_modules/**'],
};
