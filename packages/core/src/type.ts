import type { Decimal } from 'decimal.js'

/**
 * 表示 JSON 基本数据类型的联合类型，包含 string、number、boolean、null 和 Decimal
 */
export type JsonPrimitive = string | number | boolean | null | Decimal

/**
 * 表示任意合法的 JSON 值类型，可以是基本类型、对象或数组
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

/**
 * 表示 JSON 输入的基本数据类型的联合类型，包含 string、number、bigint、boolean、null、Decimal 和 Date
 */
export type JsonInputPrimitive = string | number | bigint | boolean | null | Decimal | Date

/**
 * 表示任意合法的 JSON 输入值类型，可以是基本类型、对象或数组
 */
export type JsonInputValue = JsonInputPrimitive | JsonInputObject | JsonInputArray

/**
 * 表示 JSON 对象，键为字符串，值为 JsonValue
 */
export interface JsonObject {
  [key: string]: JsonValue
}

/**
 * 表示 JSON 数组，元素为 JsonValue
 */
export type JsonArray = JsonValue[]

/**
 * 表示 JSON 输入对象，键为字符串，值为 JsonInputValue
 */
export interface JsonInputObject {
  [key: string]: JsonInputValue
}

/**
 * 表示 JSON 输入数组，元素为 JsonInputValue
 */
export type JsonInputArray = JsonInputValue[]

/**
 * 表示 JSON 文档的根类型，可以是对象 JSON 或数组 JSON
 */
export type JsonDocumentType = 'object-json' | 'array-json'

/**
 * 表示 JSON 节点的唯一标识符类型
 */
export type JsonNodeId = string

/**
 * 表示 JSON 节点的类型枚举
 */
export type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

/**
 * 表示 JSON 树中的单个节点，包含节点的所有元数据和状态信息
 */
export interface JsonNode {
  /** 节点的唯一标识符 */
  id: JsonNodeId
  /** 节点在父对象中的键名，如果父节点是数组或是根节点则可能为 undefined */
  key?: string
  /** 节点的值，如果是容器类型（对象/数组）则为 undefined */
  value?: JsonValue
  /** 子节点的数量 */
  children: number
  /** 父节点的标识符，如果是根节点则为 null */
  parent: JsonNodeId | null
  /** 节点在树中的深度（根节点为 0） */
  depth: number
  /** 节点的数据类型 */
  type: JsonNodeType
  /** 节点在文档中的路径（例如："[0].name"） */
  path: string
  /** 节点是否可以展开（即是否为包含子元素的容器节点） */
  expandable: boolean
  /** 节点在文档中前序遍历的顺序索引 */
  order: number
  /** 节点当前是否处于展开状态 */
  expanded: boolean
  /** 节点是否为叶子节点（即非容器节点） */
  leaf: boolean
  /** 以当前节点为根的子树的节点总数（包含自身） */
  size: number
  /** 当前节点的所有后代节点数量 */
  descendants: number
}

/**
 * 表示 JSON 文档的动态状态，例如节点的展开状态
 */
export interface JsonDocumentState {
  /** 当前处于展开状态的所有节点路径的集合 */
  expandedPaths: Set<string>
  /** 当前可见的节点列表（父节点折叠时，子节点不可见） */
  visibleNodes: JsonNode[]
  /** 切换指定节点的展开/折叠状态 */
  toggleExpanded: (id: JsonNodeId, expanded?: boolean) => JsonDocument
}

/**
 * 表示完整的 JSON 文档实例，包含原始数据、节点列表、状态以及操作方法
 */
export interface JsonDocument {
  /** 文档的根类型 */
  type: JsonDocumentType
  /** 文档的原始 JSON 数据 */
  raw: JsonObject | JsonArray
  /** 文档中所有节点的扁平列表 */
  nodes: JsonNode[]
  /** 文档的当前状态 */
  state: JsonDocumentState
  /** 当前可见的所有节点列表 */
  readonly visibleNodes: JsonNode[]
  /** 切换指定节点的展开/折叠状态，并返回更新后的文档实例 */
  toggleExpanded: (id: JsonNodeId, expanded?: boolean) => JsonDocument
  /** 将文档格式化为 JSON 字符串 */
  stringify: (space?: number) => string
  /** 根据节点标识符获取对应的节点 */
  getNode: (id: JsonNodeId) => JsonNode | undefined
  /** 根据节点标识符获取其父节点 */
  getParent: (id: JsonNodeId) => JsonNode | undefined
  /** 根据节点标识符获取其直接子节点列表 */
  getChildren: (id: JsonNodeId) => JsonNode[]
  /** 根据节点标识符获取其所有后代节点列表 */
  getDescendants: (id: JsonNodeId) => JsonNode[]
  /** 根据节点标识符获取其在文档中的路径 */
  getPath: (id: JsonNodeId) => string | undefined
  /** 根据路径查找对应的节点 */
  findByPath: (path: string) => JsonNode | undefined
  /** 根据查询字符串搜索节点 */
  search: (query: string) => JsonNode[]
}

/**
 * 表示 JSON 节点的标识树，用于在重新生成文档时保持节点标识的稳定性
 */
export interface JsonNodeIdentity {
  /** 节点的唯一标识符 */
  id: JsonNodeId
  /** 子节点的标识树记录，对应对象键或数组索引 */
  children?: Record<string, JsonNodeIdentity> | JsonNodeIdentity[]
}

/**
 * 创建 JSON 文档时可用的配置选项
 */
export interface CreateDocumentOptions {
  /**
   * 是否默认展开根节点。对于对象来说是顶层，对于数组来说是第一层元素
   * @default true
   */
  defaultExpandedRoot?: boolean
  /**
   * 是否默认展开所有节点
   * @default false
   */
  defaultExpandedAll?: boolean
  /**
   * 默认展开到指定层级。使用 `true` 表示展开所有层级
   * @default undefined
   */
  defaultExpandedDepth?: number | true
  /**
   * 默认展开的路径列表
   * @default undefined
   */
  expandedPaths?: Iterable<string>
  /**
   * 标识树，用于状态恢复
   * @default undefined
   */
  identityTree?: JsonNodeIdentity
  /**
   * 是否克隆原始输入数据以防止内部状态突变
   * @default false
   */
  cloneRaw?: boolean
}

/**
 * 表示可接受的 JSON 输入类型
 */
export type JsonInput = string | JsonInputObject | JsonInputArray
