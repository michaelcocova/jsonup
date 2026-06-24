import type { JsonupTheme, JsonupThemeType } from '../types.ts'

/**
 * 内置主题的颜色配置接口
 * 包含构建一个完整 Jsonup 主题所需的各项颜色属性
 */
export interface BuiltinThemeColors {
  /** 背景色 */
  background: string
  /** 前景色（默认文本颜色） */
  foreground: string
  /** 行号颜色 */
  lineNumber: string
  /** 摘要/折叠提示颜色 */
  summary: string
  /** 属性键名颜色 */
  property: string
  /** 字符串值颜色 */
  string: string
  /** 数字值颜色 */
  number: string
  /** 布尔值颜色 */
  boolean: string
  /** Null 值颜色 */
  null: string
  /** 标点符号颜色（如引号、冒号、逗号） */
  punctuation: string
}

/**
 * 快速定义并生成一个 Jsonup 主题对象
 *
 * @param name - 主题名称
 * @param type - 主题类型（亮色/暗色）
 * @param colors - 内置主题的基础和语法高亮颜色配置
 * @returns 构建完成的 Jsonup 主题配置对象
 */
export function defineTheme(
  name: string,
  type: JsonupThemeType,
  colors: BuiltinThemeColors,
): JsonupTheme {
  return {
    name,
    type,
    colors: {
      background: colors.background,
      foreground: colors.foreground,
      lineNumber: colors.lineNumber,
      summary: colors.summary,
    },
    tokenColors: [
      { scope: 'property', settings: { foreground: colors.property } },
      { scope: 'string', settings: { foreground: colors.string } },
      { scope: 'number', settings: { foreground: colors.number } },
      { scope: 'boolean', settings: { foreground: colors.boolean } },
      { scope: 'null', settings: { foreground: colors.null } },
      {
        scope: ['punctuation.quote', 'punctuation.colon', 'punctuation.comma'],
        settings: { foreground: colors.punctuation },
      },
      {
        scope: 'punctuation.bracket',
        settings: { foreground: colors.foreground },
      },
      {
        scope: ['storage.object', 'storage.array'],
        settings: { foreground: colors.foreground },
      },
    ],
  }
}
