import antfu from '@antfu/eslint-config'
import {
  coreLinter,
  docsLinter,
  operationLinter,
  sharedLinter,
  themesLinter,
  vueLinter,
} from './eslint/index.ts'

export default antfu(
  {
    vue: true,
    markdown: true,
    formatters: true,
  },
  // Shared
  sharedLinter,
  // Packages
  coreLinter,
  operationLinter,
  themesLinter,
  vueLinter,
  // Docs
  docsLinter,
)
