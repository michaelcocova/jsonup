import type { JsonDocument, JsonDocumentState, JsonNode, JsonNodeId } from './type.ts'
import { getNode } from './query.ts'

interface InternalDocumentState extends JsonDocumentState {
  syncVisibleNodes: (nodes: JsonNode[]) => JsonNode[]
}

/**
 * 创建 JSON 文档的内部状态对象，用于管理展开路径和可见节点。
 *
 * @param document - JSON 文档实例
 * @param expandedPaths - 初始展开的节点路径集合
 * @returns 初始化后的内部状态对象
 */
export function createDocumentState(
  document: JsonDocument,
  expandedPaths: Iterable<string> = [],
): InternalDocumentState {
  const state: InternalDocumentState = {
    expandedPaths: new Set(expandedPaths),
    visibleNodes: [],
    toggleExpanded(id: JsonNodeId, expanded?: boolean) {
      const node = getNode(document, id)

      if (!node?.expandable) {
        return document
      }

      const nextExpanded = expanded ?? !node.expanded

      if (node.expanded === nextExpanded) {
        return document
      }

      node.expanded = nextExpanded

      if (nextExpanded) {
        state.expandedPaths.add(node.path)
      } else {
        state.expandedPaths.delete(node.path)
      }

      state.syncVisibleNodes(document.nodes)
      return document
    },
    syncVisibleNodes(nodes: JsonNode[]) {
      state.visibleNodes = getVisibleNodes(nodes)
      return state.visibleNodes
    },
  }

  return state
}

/**
 * 根据所有节点列表和它们的展开状态，计算出当前可见的节点列表。
 * 折叠状态下的子节点会被跳过。
 *
 * @param nodes - 文档中所有节点的列表（按前序遍历顺序）
 * @returns 当前可见节点的列表
 */
export function getVisibleNodes(nodes: JsonNode[]): JsonNode[] {
  const visibleNodes: JsonNode[] = []

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]

    visibleNodes.push(node)

    if (node.expandable && !node.expanded) {
      index += node.descendants
    }
  }

  return visibleNodes
}
