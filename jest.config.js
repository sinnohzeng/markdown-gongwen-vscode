module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^vscode$': '<rootDir>/src/test/__mocks__/vscode.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/extension.ts',
    '!src/mermaid/**',
    '!src/code-block-hover-provider.ts',
    '!src/decorator/decoration-type-registry.ts',
    '!src/math/math-decorations.ts',
    '!src/forge-context.ts',
    '!src/github-context.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './dist/test-report',
        filename: 'report.html',
        openReport: false,
        inlineSource: false,
      },
    ],
  ],
  coverageDirectory: './dist/coverage',
};
