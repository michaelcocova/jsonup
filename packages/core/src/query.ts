import type { JsonDocument, JsonNode, JsonNodeId, JsonValue } from './type.ts'

/**
 * 根据节点标识符获取对应的节点实例。
 *
 * @param document - JSON 文档实例
 * @param id - 节点标识符
 * @returns 如果找到对应节点则返回，否则返回 undefined
 */
export function getNode(document: JsonDocument, id: JsonNodeId): JsonNode | undefined {
  return document.nodes.find(node => node.id === id)
}

/**
 * 根据节点标识符获取其父节点。
 *
 * @param document - JSON 文档实例
 * @param id - 节点标识符
 * @returns 如果存在父节点则返回，否则返回 undefined（如根节点或未找到）
 */
export function getParent(document: JsonDocument, id: JsonNodeId): JsonNode | undefined {
  const node = getNode(document, id)

  if (!node || node.parent === null) {
    return undefined
  }

  return getNode(document, node.parent)
}

/**
 * 根据节点标识符获取其所有的直接子节点。
 *
 * @param document - JSON 文档实例
 * @param id - 节点标识符
 * @returns 子节点列表数组
 */
export function getChildren(document: JsonDocument, id: JsonNodeId): JsonNode[] {
  return document.nodes.filter(node => node.parent === id)
}

/**
 * 根据节点标识符获取其所有的后代节点（按前序遍历顺序）。
 *
 * @param document - JSON 文档实例
 * @param id - 节点标识符
 * @returns 所有后代节点的数组
 */
export function getDescendants(document: JsonDocument, id: JsonNodeId): JsonNode[] {
  const startIndex = document.nodes.findIndex(node => node.id === id)

  if (startIndex === -1) {
    return []
  }

  const current = document.nodes[startIndex]
  const descendants: JsonNode[] = []

  for (let index = startIndex + 1; index < document.nodes.length; index += 1) {
    const candidate = document.nodes[index]

    if (candidate.depth <= current.depth) {
      break
    }

    descendants.push(candidate)
  }

  return descendants
}

/**
 * 根据节点标识符获取该节点在文档中的路径。
 *
 * @param document - JSON 文档实例
 * @param id - 节点标识符
 * @returns 节点的路径字符串，未找到时返回 undefined
 */
export function getPath(document: JsonDocument, id: JsonNodeId): string | undefined {
  return getNode(document, id)?.path
}

/**
 * 根据路径字符串精确查找对应的节点。
 *
 * @param document - JSON 文档实例
 * @param path - 节点路径字符串
 * @returns 找到的节点实例，未找到时返回 undefined
 */
export function findByPath(document: JsonDocument, path: string): JsonNode | undefined {
  return document.nodes.find(node => node.path === path)
}

/**
 * 根据查询字符串在文档中模糊搜索匹配的节点。
 * 匹配范围包括：节点的键名、路径、类型名称以及叶子节点的值。
 * 搜索忽略大小写。
 *
 * @param document - JSON 文档实例
 * @param query - 查询字符串
 * @returns 匹配到的节点列表
 */
export function search(document: JsonDocument, query: string): JsonNode[] {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return [...document.nodes]
  }

  return document.nodes.filter((node) => {
    const segments = [
      node.key,
      node.path,
      node.type,
      node.leaf ? stringifyLeafValue(node.value) : undefined,
    ]

    return segments.some(segment => segment?.toLowerCase().includes(normalized) === true)
  })
}

function stringifyLeafValue(value: JsonValue | undefined): string | undefined {
  if (
    value === undefined
    || value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    return value === undefined ? undefined : String(value)
  }

  return JSON.stringify(value)
}
