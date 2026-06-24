import type { JsonNodeId } from './type.ts'
import { nanoid } from 'nanoid'

/**
 * 内部用于在 JSON 文档实例上挂载标识树的 Symbol 键。
 */
export const DOCUMENT_IDENTITY = Symbol.for('@jsonup/document-identity')

/**
 * 生成唯一的 JSON 节点标识符。
 *
 * @returns 长度为 28 的随机唯一字符串
 */
export function createJsonNodeId(): JsonNodeId {
  return nanoid(28)
}
