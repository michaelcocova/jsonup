/**
 * Jsonup 主题类型
 * 'light' 表示亮色主题，'dark' 表示暗色主题
 */
export type JsonupThemeType = 'light' | 'dark'

/**
 * Jsonup 语法高亮的作用域
 * 对应不同的 JSON 节点类型和标点符号
 */
export type JsonupThemeScope
  = | 'string'
    | 'number'
    | 'boolean'
    | 'null'
    | 'property'
    | 'punctuation.quote.key'
    | 'punctuation.quote.string'
    | 'punctuation.quote'
    | 'punctuation.colon'
    | 'punctuation.comma'
    | 'punctuation.bracket'
    | 'meta.line-number'
    | 'meta.summary'
    | 'storage.object'
    | 'storage.array'

/**
 * Jsonup 主题配置接口
 */
export interface JsonupTheme {
  /** 主题名称 */
  name: string
  /** 主题类型（亮色/暗色） */
  type: JsonupThemeType
  /** 基础颜色配置 */
  colors: JsonupColors
  /** 词法单元（Token）的颜色配置数组 */
  tokenColors: JsonupTokenColor[]
}

/**
 * Jsonup 基础颜色配置接口
 */
export interface JsonupColors {
  /** 背景色 */
  background?: string
  /** 前景色（默认文本颜色） */
  foreground?: string
  /** 行号颜色 */
  lineNumber?: string
  /** 摘要/折叠提示文字颜色 */
  summary?: string
}

/**
 * 词法单元颜色配置接口
 */
export interface JsonupTokenColor {
  /** 匹配的作用域，可以是单个作用域或作用域数组 */
  scope: JsonupThemeScope | JsonupThemeScope[]
  /** 针对该作用域的样式设置 */
  settings: JsonupTokenSettings
}

/**
 * 词法单元的样式设置接口
 */
export interface JsonupTokenSettings {
  /** 前景色 */
  foreground?: string
}

/**
 * Jsonup 主题映射的 CSS 变量记录类型
 */
export type JsonupThemeCssVars = Partial<Record<JsonupThemeCssVarName, string>>

/**
 * Jsonup 内部使用的 CSS 变量名称类型
 */
export type JsonupThemeCssVarName
  = | '--jv-background'
    | '--jv-foreground'
    | '--jv-line-number'
    | '--jv-summary'
    | '--jv-property'
    | '--jv-string'
    | '--jv-number'
    | '--jv-boolean'
    | '--jv-null'
    | '--jv-punctuation-quote-key'
    | '--jv-punctuation-quote-string'
    | '--jv-punctuation-quote'
    | '--jv-punctuation-colon'
    | '--jv-punctuation-comma'
    | '--jv-punctuation-bracket'
    | '--jv-storage-object'
    | '--jv-storage-array'
