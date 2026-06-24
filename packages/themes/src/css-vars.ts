import type {
  JsonupColors,
  JsonupTheme,
  JsonupThemeCssVarName,
  JsonupThemeCssVars,
  JsonupThemeScope,
} from './types.ts'

const COLOR_VAR_MAP: Record<keyof JsonupColors, JsonupThemeCssVarName> = {
  background: '--jv-background',
  foreground: '--jv-foreground',
  lineNumber: '--jv-line-number',
  summary: '--jv-summary',
}

const SCOPE_VAR_MAP: Record<JsonupThemeScope, JsonupThemeCssVarName> = {
  'string': '--jv-string',
  'number': '--jv-number',
  'boolean': '--jv-boolean',
  'null': '--jv-null',
  'property': '--jv-property',
  'punctuation.quote.key': '--jv-punctuation-quote-key',
  'punctuation.quote.string': '--jv-punctuation-quote-string',
  'punctuation.quote': '--jv-punctuation-quote',
  'punctuation.colon': '--jv-punctuation-colon',
  'punctuation.comma': '--jv-punctuation-comma',
  'punctuation.bracket': '--jv-punctuation-bracket',
  'meta.line-number': '--jv-line-number',
  'meta.summary': '--jv-summary',
  'storage.object': '--jv-storage-object',
  'storage.array': '--jv-storage-array',
}

/**
 * 将 Jsonup 主题对象转换为 CSS 变量对象
 *
 * @param theme - 要转换的 Jsonup 主题对象，如果为 undefined 或 null 则返回空对象
 * @returns 包含映射后 CSS 变量名及其对应颜色值的对象
 */
export function useCssVars(theme?: JsonupTheme | null): JsonupThemeCssVars {
  if (!theme) {
    return {}
  }

  const cssVars: JsonupThemeCssVars = {}

  for (const [colorName, cssVarName] of Object.entries(COLOR_VAR_MAP) as Array<
    [keyof JsonupColors, JsonupThemeCssVarName]
  >) {
    const value = theme.colors[colorName]

    if (value) {
      cssVars[cssVarName] = value
    }
  }

  for (const tokenColor of theme.tokenColors) {
    const scopes = Array.isArray(tokenColor.scope) ? tokenColor.scope : [tokenColor.scope]
    const foreground = tokenColor.settings.foreground

    if (!foreground) {
      continue
    }

    for (const scope of scopes) {
      cssVars[SCOPE_VAR_MAP[scope]] = foreground
    }
  }

  return cssVars
}
