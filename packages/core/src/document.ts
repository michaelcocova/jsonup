import type {
  CreateDocumentOptions,
  JsonArray,
  JsonDocument,
  JsonInput,
  JsonNode,
  JsonNodeId,
  JsonNodeIdentity,
  JsonNodeType,
  JsonObject,
  JsonValue,
} from './type.ts'
import { Decimal } from 'decimal.js'
import { createJsonNodeId, DOCUMENT_IDENTITY } from './identity.ts'
import { isContainerValue, isJsonObject, toJsonRoot } from './normalize.ts'
import { buildChildPath } from './path.ts'
import {
  findByPath,
  getChildren,
  getDescendants,
  getNode,
  getParent,
  getPath,
  search,
} from './query.ts'
import { createDocumentState } from './state.ts'

interface WalkState {
  nextOrder: number
  expandedPaths: Set<string>
  hasExplicitExpandedPaths: boolean
  defaultExpandedAll: boolean
  defaultExpandedDepth: number | true | undefined
}

interface ResolvedCreateDocumentOptions {
  hasExplicitExpandedPaths: boolean
  expandedPaths: Set<string>
  defaultExpandedAll: boolean
  defaultExpandedDepth: number | true | undefined
  identityTree?: JsonNodeIdentity
  cloneRaw: boolean
}

/**
 * 创建并初始化一个 JSON 文档实例。
 * 将原始输入数据转换为包含树形结构信息、节点标识和交互状态的文档对象。
 *
 * @param input - 原始的 JSON 输入或现有的 JSON 文档实例
 * @param options - 创建文档时的配置选项
 * @returns 初始化后的完整 JSON 文档实例
 */
export function createDocument(
  input: JsonInput | JsonDocument,
  options: CreateDocumentOptions = {},
): JsonDocument {
  const normalizedInput = isJsonDocument(input) ? input.raw : toJsonRoot(input)
  const resolvedOptions = resolveCreateDocumentOptions(input, options)
  const raw
    = resolvedOptions.cloneRaw === false ? normalizedInput : structuredClone(normalizedInput)
  const identityTree = createIdentityTree(raw, resolvedOptions.identityTree)
  const state: WalkState = {
    nextOrder: 0,
    expandedPaths: new Set(resolvedOptions.expandedPaths),
    hasExplicitExpandedPaths: resolvedOptions.hasExplicitExpandedPaths,
    defaultExpandedAll: resolvedOptions.defaultExpandedAll,
    defaultExpandedDepth: resolvedOptions.defaultExpandedDepth,
  }
  const nodes: JsonNode[] = []

  walkValue(raw, identityTree, {
    depth: 0,
    key: undefined,
    parent: null,
    path: '',
    nodes,
    state,
  })

  const document = {
    type: Array.isArray(raw) ? 'array-json' : 'object-json',
    raw,
    nodes,
    state: undefined as unknown as JsonDocument['state'],
  } as JsonDocument
  const documentState = createDocumentState(document, state.expandedPaths)

  Object.defineProperty(document, DOCUMENT_IDENTITY, {
    value: identityTree,
    enumerable: false,
    configurable: false,
    writable: false,
  })
  Object.defineProperty(document, 'state', {
    value: documentState,
    enumerable: true,
    configurable: false,
    writable: false,
  })
  Object.defineProperties(document, {
    visibleNodes: {
      get() {
        return documentState.visibleNodes
      },
      enumerable: false,
      configurable: false,
    },
    toggleExpanded: {
      value(id: JsonNodeId, expanded?: boolean) {
        return documentState.toggleExpanded(id, expanded)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    stringify: {
      value(space = 2) {
        return stringify(document, space)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    getNode: {
      value(id: JsonNodeId) {
        return getNode(document, id)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    getParent: {
      value(id: JsonNodeId) {
        return getParent(document, id)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    getChildren: {
      value(id: JsonNodeId) {
        return getChildren(document, id)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    getDescendants: {
      value(id: JsonNodeId) {
        return getDescendants(document, id)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    getPath: {
      value(id: JsonNodeId) {
        return getPath(document, id)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    findByPath: {
      value(path: string) {
        return findByPath(document, path)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    search: {
      value(query: string) {
        return search(document, query)
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
  })
  documentState.syncVisibleNodes(document.nodes)

  return document
}

/**
 * 获取 JSON 文档的标识树（Identity Tree）。
 * 标识树用于在重新生成文档时保持节点的唯一标识，从而维持状态（如展开/折叠状态）的一致性。
 *
 * @param document - 目标 JSON 文档实例
 * @returns 对应的节点标识树
 * @throws 当文档中缺少标识树时抛出错误
 */
export function getDocumentIdentityTree(document: JsonDocument): JsonNodeIdentity {
  const identityTree = (
    document as JsonDocument & {
      [DOCUMENT_IDENTITY]?: JsonNodeIdentity
    }
  )[DOCUMENT_IDENTITY]

  if (!identityTree) {
    throw new Error('Document identity tree is missing.')
  }

  return identityTree
}

/**
 * 将 JSON 文档序列化为 JSON 字符串。
 * 会自动处理 Decimal 类型的数值。
 *
 * @param document - 要序列化的 JSON 文档实例
 * @param space - 用于缩进的空格数，默认为 2
 * @returns 序列化后的 JSON 字符串
 */
export function stringify(document: JsonDocument, space = 2): string {
  return JSON.stringify(
    document.raw,
    (_key, value) => (Decimal.isDecimal(value) ? value.toString() : value),
    space,
  )
}

/**
 * 判断给定的值是否为有效的 JSON 文档实例。
 *
 * @param value - 要检查的值
 * @returns 如果是有效的 JsonDocument 返回 true，否则返回 false
 */
export function isJsonDocument(value: JsonInput | JsonDocument): value is JsonDocument {
  return (
    typeof value === 'object'
    && value !== null
    && 'raw' in value
    && 'nodes' in value
    && 'state' in value
    && 'type' in value
  )
}

function walkValue(
  value: JsonValue,
  identity: JsonNodeIdentity,
  context: {
    depth: number
    key: string | undefined
    parent: JsonNodeId | null
    path: string
    nodes: JsonNode[]
    state: WalkState
  },
): { size: number, expanded: boolean } {
  const { depth, key, parent, path, nodes, state } = context
  const type = getNodeType(value)
  const container = isContainerValue(value)
  const childrenEntries = container ? getContainerEntries(value, identity) : []
  const children = childrenEntries.length
  const expandable = container && children > 0
  const expanded = shouldExpandNode(path, depth, expandable, state)
  const node: JsonNode = {
    id: identity.id,
    key,
    value: container ? undefined : value,
    children,
    parent,
    depth,
    type,
    path,
    expandable,
    order: state.nextOrder,
    expanded,
    leaf: !container,
    size: 1,
    descendants: 0,
  }

  if (expanded) {
    state.expandedPaths.add(path)
  }

  nodes.push(node)
  state.nextOrder += 1

  let subtreeSize = 1
  let hasExpandedDescendant = false

  for (const [childKey, childValue, childIdentity] of childrenEntries) {
    const childResult = walkValue(childValue, childIdentity, {
      depth: depth + 1,
      key: childKey,
      parent: identity.id,
      path: buildChildPath(path, childKey, Array.isArray(value)),
      nodes,
      state,
    })

    subtreeSize += childResult.size
    if (childResult.expanded) {
      hasExpandedDescendant = true
    }
  }

  if (hasExpandedDescendant && expandable && !node.expanded) {
    node.expanded = true
    state.expandedPaths.add(path)
  }

  node.size = subtreeSize
  node.descendants = subtreeSize - 1

  return { size: subtreeSize, expanded: node.expanded }
}

function createIdentityTree(value: JsonValue, existing?: JsonNodeIdentity): JsonNodeIdentity {
  const id = existing?.id ?? createJsonNodeId()

  if (Array.isArray(value)) {
    const existingChildren = Array.isArray(existing?.children) ? existing.children : []

    return {
      id,
      children: value.map((item, index) => createIdentityTree(item, existingChildren[index])),
    }
  }

  if (isJsonObject(value)) {
    const existingChildren = isIdentityRecord(existing?.children) ? existing.children : {}
    const children: Record<string, JsonNodeIdentity> = {}

    for (const [key, item] of Object.entries(value)) {
      children[key] = createIdentityTree(item, existingChildren[key])
    }

    return {
      id,
      children,
    }
  }

  return { id }
}

function resolveCreateDocumentOptions(
  input: JsonInput | JsonDocument,
  options: CreateDocumentOptions,
): ResolvedCreateDocumentOptions {
  const defaultExpandedRoot = options.defaultExpandedRoot ?? true
  let defaultExpandedDepth = options.defaultExpandedDepth

  if (defaultExpandedDepth === undefined && defaultExpandedRoot && !options.defaultExpandedAll) {
    const raw = isJsonDocument(input) ? input.raw : input
    defaultExpandedDepth = Array.isArray(raw) ? 1 : 0
  }

  const defaultExpandedAll = options.defaultExpandedAll ?? false
  const cloneRaw = options.cloneRaw ?? false
  const identityTree
    = options.identityTree ?? (isJsonDocument(input) ? getDocumentIdentityTree(input) : undefined)
  const previousExpandedPaths = isJsonDocument(input)
    ? Array.from(input.state.expandedPaths)
    : undefined
  const hasExplicitExpandedPaths
    = options.expandedPaths !== undefined
      || (defaultExpandedDepth === undefined
        && !defaultExpandedAll
        && previousExpandedPaths !== undefined)
  const expandedPaths
    = options.expandedPaths !== undefined
      ? new Set(options.expandedPaths)
      : hasExplicitExpandedPaths
        ? new Set(previousExpandedPaths)
        : new Set<string>()

  return {
    hasExplicitExpandedPaths,
    expandedPaths,
    defaultExpandedAll,
    defaultExpandedDepth,
    identityTree,
    cloneRaw,
  }
}

function shouldExpandNode(
  path: string,
  depth: number,
  expandable: boolean,
  state: WalkState,
): boolean {
  if (!expandable) {
    return false
  }

  if (state.hasExplicitExpandedPaths && state.expandedPaths.has(path)) {
    return true
  }

  if (state.defaultExpandedDepth !== undefined) {
    return state.defaultExpandedDepth === true ? true : depth <= state.defaultExpandedDepth
  }

  return state.defaultExpandedAll
}

function getContainerEntries(
  value: JsonObject | JsonArray,
  identity: JsonNodeIdentity,
): Array<[string, JsonValue, JsonNodeIdentity]> {
  if (Array.isArray(value)) {
    const children = Array.isArray(identity.children) ? identity.children : []

    return value.map((item, index) => {
      const childIdentity = children[index]

      if (!childIdentity) {
        throw new Error('Array identity tree is out of sync.')
      }

      return [String(index), item, childIdentity]
    })
  }

  if (!isIdentityRecord(identity.children)) {
    throw new Error('Object identity tree is out of sync.')
  }

  const children = identity.children

  return Object.entries(value).map(([key, item]) => {
    const childIdentity = children[key]

    if (!childIdentity) {
      throw new Error(`Object identity tree is missing key "${key}".`)
    }

    return [key, item, childIdentity]
  })
}

function getNodeType(value: JsonValue): JsonNodeType {
  if (value === null) {
    return 'null'
  }

  if (Decimal.isDecimal(value)) {
    return 'number'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  if (typeof value === 'object') {
    return 'object'
  }

  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      throw new TypeError('Unsupported JSON value type.')
  }
}

function isIdentityRecord(
  children: JsonNodeIdentity['children'] | undefined,
): children is Record<string, JsonNodeIdentity> {
  return children !== undefined && !Array.isArray(children)
}
