import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
  {
    files: 'dist/test/e2e/suite/**/*.test.js',
    mocha: {
      ui: 'tdd',
      timeout: 20000,
    },
  },
]);
