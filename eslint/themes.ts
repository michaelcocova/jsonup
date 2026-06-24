import type { Linter } from 'eslint'

export const themesLinter: Linter.Config = {
  files: ['packages/themes/**/*.{js,mjs,cjs,ts,mts,cts}'],
  rules: {
    'no-console': 'warn',
  },
}
