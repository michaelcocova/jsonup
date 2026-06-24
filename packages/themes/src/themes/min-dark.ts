import { defineTheme } from './define-theme.ts'

export const MinDark = defineTheme('min-dark', 'dark', {
  background: '#1F1F1F',
  foreground: '#888888',
  lineNumber: '#727272',
  summary: '#888888',
  property: '#79B8FF',
  string: '#9DB1C5',
  number: '#79B8FF',
  boolean: '#B392F0',
  null: '#B392F0',
  punctuation: '#F97583',
})
