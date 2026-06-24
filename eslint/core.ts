import type { Linter } from 'eslint'

export const coreLinter: Linter.Config = {
  files: ['packages/core/**/*.{js,mjs,cjs,ts,mts,cts}'],
  rules: {
    'no-console': 'warn',
  },
}
