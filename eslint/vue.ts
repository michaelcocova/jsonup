import type { Linter } from 'eslint'

export const vueLinter: Linter.Config = {
  files: ['packages/vue/**/*.{ts,tsx,vue}'],
  rules: {
    'no-console': 'warn',
    'vue/block-tag-newline': 'off',
    'vue/valid-v-on': 'warn',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: { max: 1 },
        multiline: { max: 1 },
      },
    ],
    'vue/block-order': [
      'error',
      { order: ['script', 'template', 'style'] },
    ],
    'vue/component-api-style': ['error', ['script-setup', 'composition']],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false },
    ],
    'vue/define-props-declaration': ['error', 'type-based'],
    'vue/no-multi-spaces': [
      'error',
      { ignoreProperties: false },
    ],
  },
}
