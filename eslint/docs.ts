import type { Linter } from 'eslint'

export const docsLinter: Linter.Config = {
  files: ['docs/**/*.{ts,tsx,vue,md}', '**/*.md/**'],
  rules: {
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}
