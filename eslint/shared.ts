import type { Linter } from 'eslint'

export const sharedLinter: Linter.Config = {
  rules: {
    'style/brace-style': ['error', '1tbs'],
    'ts/ban-ts-comment': 'off',

    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
}
