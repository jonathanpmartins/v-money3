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
  // parser: 'vue-eslint-parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.eslint.json',
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      jsx: true
    }
  },
  // overrides: [
  //   { files: ['*.ts'], parser: '@typescript-eslint/parser' },
  //   { files: ['*.vue'], parser: 'vue-eslint-parser' }
  // ],
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',

    // 'plugin:vue/vue3-recommended',

    'airbnb-base',
    'airbnb-typescript/base',

    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',

    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'no-param-reassign': 'off',
    'no-nested-ternary': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-undef': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-console': 'off',
    // 'vue/script-setup-uses-vars': 'error',
  },
  ignorePatterns: ['/dist/**', '/node_modules/**', '.eslintrc.js'],
};
