import type { Linter } from 'eslint'

export const operationLinter: Linter.Config = {
  files: ['packages/operation/**/*.{js,mjs,cjs,ts,mts,cts}'],
  rules: {
    'no-console': 'warn',
  },
}
