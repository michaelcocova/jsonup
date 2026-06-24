import type { JsonDocument, JsonNode, JsonNodeId } from '@jsonup/core'
import { getChildren } from '@jsonup/core'

/**
 * Jsonup 查看器行类型
 * - `open`: 展开容器的起始行（包含起始括号）
 * - `property`: 属性行（包含键值对）
 * - `close`: 展开容器的结束行（包含结束括号）
 * - `collapsed`: 折叠的容器行
 */
export type JsonupViewerLineKind = 'open' | 'property' | 'close' | 'collapsed'

/**
 * Jsonup 查看器行接口定义
 */
export interface JsonupViewerLine {
  /** 行的唯一标识符 */
  id: string
  /** 行的类型 */
  kind: JsonupViewerLineKind
  /** 关联的 JSON 节点 */
  node: JsonNode
  /** 节点在树中的深度 */
  depth: number
  /** 行的纯文本内容 */
  text: string
  /** 行号（从 1 开始） */
  lineNumber: number
  /** 行是否可交互（例如点击展开/折叠） */
  interactive: boolean
}

/**
 * 基于可见节点创建查看器行数组
 * @param document JSON 文档对象
 * @param visibleNodes 可见的 JSON 节点数组
 * @returns 生成的查看器行数组
 */
export function createViewerLines(
  document: JsonDocument,
  visibleNodes: JsonNode[],
): JsonupViewerLine[] {
  const lines: JsonupViewerLine[] = []
  const visibleIds = new Set(visibleNodes.map(node => node.id))
  const visibleByParent = new Map<JsonNodeId | null, JsonNode[]>()

  for (const node of visibleNodes) {
    const siblings = visibleByParent.get(node.parent) ?? []
    siblings.push(node)
    visibleByParent.set(node.parent, siblings)
  }

  for (const node of visibleByParent.get(null) ?? []) {
    appendNodeLines(document, visibleIds, visibleByParent, lines, node)
  }

  return lines
}

function appendNodeLines(
  document: JsonDocument,
  visibleIds: Set<JsonNodeId>,
  visibleByParent: Map<JsonNodeId | null, JsonNode[]>,
  lines: JsonupViewerLine[],
  node: JsonNode,
): void {
  if (node.leaf) {
    pushLine(lines, {
      id: `${node.id}:property`,
      kind: 'property',
      node,
      depth: node.depth,
      text: formatPropertyLine(node),
      interactive: true,
    })
    return
  }

  if (!node.expanded) {
    pushLine(lines, {
      id: `${node.id}:collapsed`,
      kind: 'collapsed',
      node,
      depth: node.depth,
      text: formatCollapsedLine(node),
      interactive: true,
    })
    return
  }

  pushLine(lines, {
    id: `${node.id}:open`,
    kind: 'open',
    node,
    depth: node.depth,
    text: formatOpenLine(node),
    interactive: true,
  })

  for (const child of visibleByParent.get(node.id) ?? []) {
    appendNodeLines(document, visibleIds, visibleByParent, lines, child)
  }

  if (shouldRenderCloseLine(document, visibleIds, node)) {
    pushLine(lines, {
      id: `${node.id}:close`,
      kind: 'close',
      node,
      depth: node.depth,
      text: formatCloseLine(document, node),
      interactive: false,
    })
  }
}

function pushLine(lines: JsonupViewerLine[], line: Omit<JsonupViewerLine, 'lineNumber'>): void {
  lines.push({
    ...line,
    lineNumber: lines.length + 1,
  })
}

function shouldRenderCloseLine(
  document: JsonDocument,
  visibleIds: Set<JsonNodeId>,
  node: JsonNode,
): boolean {
  if (!node.expanded) {
    return false
  }

  const children = getChildren(document, node.id)

  if (children.length === 0) {
    return true
  }

  return children.every(child => visibleIds.has(child.id))
}

function formatOpenLine(node: JsonNode): string {
  return `${formatKey(node)}${node.type === 'array' ? '[' : '{'}`
}

function formatCloseLine(document: JsonDocument, node: JsonNode): string {
  const closer = node.type === 'array' ? ']' : '}'
  return `${closer}${hasNextSibling(document, node) ? ',' : ''}`
}

function formatCollapsedLine(node: JsonNode): string {
  const summary = node.type === 'array' ? `${node.children} items` : `${node.children} keys`
  const brackets = node.type === 'array' ? ['[', ']'] : ['{', '}']

  return `${formatKey(node)}${brackets[0]} ${summary} ${brackets[1]}`
}

function formatPropertyLine(node: JsonNode): string {
  return `${formatKey(node)}${formatValue(node)}${hasSyntheticComma(node) ? ',' : ''}`
}

function formatKey(node: JsonNode): string {
  if (node.depth === 0 || node.key === undefined) {
    return ''
  }

  if (node.parent && /^\d+$/.test(node.key)) {
    return ''
  }

  return `${JSON.stringify(node.key)}: `
}

function formatValue(node: JsonNode): string {
  if (node.value === undefined) {
    return ''
  }

  return JSON.stringify(node.value)
}

function hasNextSibling(document: JsonDocument, node: JsonNode): boolean {
  if (node.parent === null) {
    return false
  }

  const siblings = getChildren(document, node.parent)
  return siblings[siblings.length - 1]?.id !== node.id
}

function hasSyntheticComma(node: JsonNode): boolean {
  return node.parent !== null
}
