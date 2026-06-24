import type { JsonArray, JsonDocument, JsonNodeId, JsonNodeIdentity, JsonObject, JsonValue } from '@jsonup/core'
import {
  createDocument,
  createJsonNodeId,
  getDocumentIdentityTree,
  getNode,
  isContainerValue,
  isJsonObject,

  toJsonValue,
} from '@jsonup/core'

/**
 * 对象节点插入输入的参数接口。
 * 用于向 JSON 对象节点中插入新属性。
 */
export interface ObjectInsertInput {
  /**
   * 插入属性的键名。
   */
  key: string
  /**
   * 插入属性的值，可以是任何合法的 JSON 对应值，将会被转化为标准的 JsonValue。
   */
  value: unknown
}

/**
 * 数组节点插入输入的参数接口。
 * 用于向 JSON 数组节点中插入新元素。
 */
export interface ArrayInsertInput {
  /**
   * 插入元素的目标索引。如果未提供，默认插入到数组末尾。
   */
  index?: number
  /**
   * 插入元素的值，可以是任何合法的 JSON 对应值，将会被转化为标准的 JsonValue。
   */
  value: unknown
}

/**
 * 插入操作的输入类型，可以是对象插入输入或数组插入输入。
 */
export type InsertInput = ObjectInsertInput | ArrayInsertInput

/**
 * 移动节点时的选项接口。
 */
export interface MoveOptions {
  /**
   * 移动到对象节点时使用的新键名。如果未提供，将尝试使用原节点的键名。
   */
  key?: string
  /**
   * 移动到数组节点时使用的目标索引。如果未提供，默认移动到数组末尾。
   */
  index?: number
}

/**
 * 更新 JSON 文档中指定节点的值。
 * @param document 当前的 JSON 文档对象。
 * @param id 需要更新的节点的唯一标识符 (JsonNodeId)。
 * @param value 新的值，将会被转化为标准的 JsonValue。
 * @returns 返回一个新的包含更新后内容的 JSON 文档。
 * @throws 当指定的节点不存在，或者更新根节点时值不是对象或数组时抛出错误。
 */
export function updateValue(document: JsonDocument, id: JsonNodeId, value: unknown): JsonDocument {
  getRequiredNode(document, id)
  const nextValue = toJsonValue(value)
  let nextRaw: JsonObject | JsonArray = cloneJsonValue(document.raw)
  let nextIdentityTree = cloneIdentityTree(getDocumentIdentityTree(document))
  const location = findRequiredLocation(nextRaw, nextIdentityTree, id)

  if (location.parentValue === null || location.parentIdentity === null) {
    if (!isContainerValue(nextValue)) {
      throw new TypeError('JSON root must be an object or array.')
    }

    nextRaw = nextValue
    nextIdentityTree = createIdentityTree(nextValue, location.identity.id)
  } else {
    assignChild(location.parentValue, location.key, nextValue)
    replaceIdentityChild(
      location.parentIdentity,
      location.key,
      createIdentityTree(nextValue, location.identity.id),
    )
  }

  return rebuildDocument(document, nextRaw, nextIdentityTree)
}

/**
 * 在 JSON 文档的指定父节点中插入新的子节点。
 * @param document 当前的 JSON 文档对象。
 * @param parentId 目标父节点的唯一标识符 (JsonNodeId)。
 * @param input 插入的参数，包含键名/索引和值。
 * @returns 返回一个新的包含插入节点后的 JSON 文档。
 * @throws 当目标父节点不是对象或数组，或者在对象中键已存在，或输入类型不匹配时抛出错误。
 */
export function insert(
  document: JsonDocument,
  parentId: JsonNodeId,
  input: InsertInput,
): JsonDocument {
  const parent = getRequiredNode(document, parentId)
  const nextRaw = cloneJsonValue(document.raw)
  const nextIdentityTree = cloneIdentityTree(getDocumentIdentityTree(document))
  const parentLocation = findRequiredLocation(nextRaw, nextIdentityTree, parentId)
  const parentValue = parentLocation.value

  if (parent.type === 'object') {
    if (!isObjectInsertInput(input)) {
      throw new TypeError('Object insert requires a key.')
    }

    if (!isJsonObject(parentValue)) {
      throw new TypeError('Target parent is not an object.')
    }

    if (Object.hasOwn(parentValue, input.key)) {
      throw new Error(`Key "${input.key}" already exists.`)
    }

    parentValue[input.key] = toJsonValue(input.value)
    ensureObjectIdentityChildren(parentLocation.identity)[input.key] = createIdentityTree(
      parentValue[input.key],
    )
    return rebuildDocument(document, nextRaw, nextIdentityTree)
  }

  if (parent.type === 'array') {
    if (isObjectInsertInput(input)) {
      throw new TypeError('Array insert does not accept an object key.')
    }

    if (!Array.isArray(parentValue)) {
      throw new TypeError('Target parent is not an array.')
    }

    const index = normalizeArrayIndex(input.index ?? parentValue.length, true)
    const childValue = toJsonValue(input.value)
    parentValue.splice(index, 0, childValue)
    ensureArrayIdentityChildren(parentLocation.identity).splice(
      index,
      0,
      createIdentityTree(childValue),
    )
    return rebuildDocument(document, nextRaw, nextIdentityTree)
  }

  throw new TypeError('Insert target must be an object or array node.')
}

/**
 * 从 JSON 文档中移除指定的节点。
 * @param document 当前的 JSON 文档对象。
 * @param id 需要移除的节点的唯一标识符 (JsonNodeId)。
 * @returns 返回一个新的移除了指定节点后的 JSON 文档。
 * @throws 当指定的节点不存在，或者尝试移除根节点时抛出错误。
 */
export function remove(document: JsonDocument, id: JsonNodeId): JsonDocument {
  const node = getRequiredNode(document, id)

  if (node.parent === null) {
    throw new Error('Cannot remove the root node.')
  }

  const nextRaw = cloneJsonValue(document.raw)
  const nextIdentityTree = cloneIdentityTree(getDocumentIdentityTree(document))
  const location = findRequiredLocation(nextRaw, nextIdentityTree, id)

  if (location.parentValue === null || location.parentIdentity === null) {
    throw new Error('Cannot remove the root node.')
  }

  removeChild(location.parentValue, location.parentIdentity, location.key)
  return rebuildDocument(document, nextRaw, nextIdentityTree)
}

/**
 * 重命名 JSON 文档中指定对象子节点的键名。
 * @param document 当前的 JSON 文档对象。
 * @param id 需要重命名键的节点的唯一标识符 (JsonNodeId)。
 * @param nextKey 新的键名。
 * @returns 返回一个新的重命名键后的 JSON 文档。
 * @throws 当目标节点不是对象子节点，或者新键名已存在，或键名为空时抛出错误。
 */
export function renameKey(document: JsonDocument, id: JsonNodeId, nextKey: string): JsonDocument {
  const node = getRequiredNode(document, id)
  const parent = getRequiredParent(document, id)

  if (parent.type !== 'object') {
    throw new TypeError('Only object children can be renamed.')
  }

  if (!node.key) {
    throw new Error('Target node does not have a key.')
  }

  if (!nextKey) {
    throw new Error('Key must not be empty.')
  }

  const nextRaw = cloneJsonValue(document.raw)
  const nextIdentityTree = cloneIdentityTree(getDocumentIdentityTree(document))
  const location = findRequiredLocation(nextRaw, nextIdentityTree, id)

  if (location.parentValue === null || location.parentIdentity === null) {
    throw new Error('Cannot rename the root node.')
  }

  if (typeof location.key !== 'string') {
    throw new TypeError('Array items cannot be renamed.')
  }

  renameObjectChild(location.parentValue, location.parentIdentity, location.key, nextKey)
  return rebuildDocument(document, nextRaw, nextIdentityTree)
}

/**
 * 将 JSON 文档中的指定节点移动到另一个父节点下。
 * @param document 当前的 JSON 文档对象。
 * @param id 需要移动的节点的唯一标识符 (JsonNodeId)。
 * @param parentId 目标父节点的唯一标识符 (JsonNodeId)。
 * @param options 移动时的额外选项，如移动到对象中的新键名，或移动到数组中的目标索引。
 * @returns 返回一个新的包含移动节点后的 JSON 文档。
 * @throws 当目标父节点不是对象或数组，尝试移动根节点，或者尝试将节点移动到其自身的子代中时抛出错误。
 */
export function move(
  document: JsonDocument,
  id: JsonNodeId,
  parentId: JsonNodeId,
  options: MoveOptions = {},
): JsonDocument {
  const node = getRequiredNode(document, id)
  const targetParent = getRequiredNode(document, parentId)

  if (node.parent === null) {
    throw new Error('Cannot move the root node.')
  }

  if (targetParent.type !== 'object' && targetParent.type !== 'array') {
    throw new TypeError('Move target must be an object or array node.')
  }

  if (isSubPath(targetParent.path, node.path)) {
    throw new Error('Cannot move a node into its own descendant.')
  }

  const nextRaw = cloneJsonValue(document.raw)
  const nextIdentityTree = cloneIdentityTree(getDocumentIdentityTree(document))
  const sourceLocation = findRequiredLocation(nextRaw, nextIdentityTree, id)

  if (sourceLocation.parentValue === null || sourceLocation.parentIdentity === null) {
    throw new Error('Cannot move the root node.')
  }

  const movedValue = cloneJsonValue(sourceLocation.value)
  const movedIdentity = cloneIdentityTree(sourceLocation.identity)
  removeChild(sourceLocation.parentValue, sourceLocation.parentIdentity, sourceLocation.key)

  const targetLocation = findRequiredLocation(nextRaw, nextIdentityTree, parentId)
  const targetValue = targetLocation.value

  if (targetParent.type === 'object') {
    if (!isJsonObject(targetValue)) {
      throw new TypeError('Move target is not an object.')
    }

    const nextKey = options.key ?? (isArrayItemKey(node.key) ? undefined : node.key)

    if (!nextKey) {
      throw new Error('Moving into an object requires a stable key.')
    }

    if (Object.hasOwn(targetValue, nextKey)) {
      throw new Error(`Key "${nextKey}" already exists.`)
    }

    targetValue[nextKey] = movedValue
    ensureObjectIdentityChildren(targetLocation.identity)[nextKey] = movedIdentity
    return rebuildDocument(document, nextRaw, nextIdentityTree)
  }

  if (!Array.isArray(targetValue)) {
    throw new TypeError('Move target is not an array.')
  }

  const index = normalizeArrayIndex(options.index ?? targetValue.length, true)
  targetValue.splice(index, 0, movedValue)
  ensureArrayIdentityChildren(targetLocation.identity).splice(index, 0, movedIdentity)
  return rebuildDocument(document, nextRaw, nextIdentityTree)
}

function rebuildDocument(
  previous: JsonDocument,
  nextRaw: JsonObject | JsonArray,
  nextIdentityTree: JsonNodeIdentity,
): JsonDocument {
  return createDocument(nextRaw, {
    defaultExpandedRoot: false,
    defaultExpandedAll: false,
    expandedPaths: previous.state.expandedPaths,
    identityTree: nextIdentityTree,
    cloneRaw: false,
  })
}

function getRequiredNode(document: JsonDocument, id: JsonNodeId) {
  const node = getNode(document, id)

  if (!node) {
    throw new Error(`Node ${id} does not exist.`)
  }

  return node
}

function getRequiredParent(document: JsonDocument, id: JsonNodeId) {
  const node = getRequiredNode(document, id)

  if (node.parent === null) {
    throw new Error('Root node does not have a parent.')
  }

  return getRequiredNode(document, node.parent)
}

function findRequiredLocation(
  raw: JsonObject | JsonArray,
  identity: JsonNodeIdentity,
  targetId: JsonNodeId,
): LocatedNode {
  const location = findLocationById(raw, identity, targetId)

  if (!location) {
    throw new Error(`Node ${targetId} does not exist.`)
  }

  return location
}

function findLocationById(
  value: JsonValue,
  identity: JsonNodeIdentity,
  targetId: JsonNodeId,
  parentValue: JsonObject | JsonArray | null = null,
  parentIdentity: JsonNodeIdentity | null = null,
  key: string | number | null = null,
): LocatedNode | undefined {
  if (identity.id === targetId) {
    return {
      value,
      identity,
      parentValue,
      parentIdentity,
      key,
    }
  }

  if (Array.isArray(value)) {
    const children = ensureArrayIdentityChildren(identity)

    for (const [index, item] of value.entries()) {
      const childIdentity = children[index]
      const found = findLocationById(item, childIdentity, targetId, value, identity, index)

      if (found) {
        return found
      }
    }

    return undefined
  }

  if (isJsonObject(value)) {
    const children = ensureObjectIdentityChildren(identity)

    for (const [childKey, item] of Object.entries(value)) {
      const childIdentity = children[childKey]
      const found = findLocationById(item, childIdentity, targetId, value, identity, childKey)

      if (found) {
        return found
      }
    }
  }

  return undefined
}

function assignChild(
  parentValue: JsonObject | JsonArray,
  key: string | number | null,
  value: JsonValue,
) {
  if (typeof key === 'number') {
    if (!Array.isArray(parentValue)) {
      throw new TypeError('Target parent is not an array.')
    }

    parentValue[key] = value
    return
  }

  if (typeof key === 'string') {
    if (!isJsonObject(parentValue)) {
      throw new TypeError('Target parent is not an object.')
    }

    parentValue[key] = value
    return
  }

  throw new Error('Child key is missing.')
}

function replaceIdentityChild(
  parentIdentity: JsonNodeIdentity,
  key: string | number | null,
  childIdentity: JsonNodeIdentity,
) {
  if (typeof key === 'number') {
    ensureArrayIdentityChildren(parentIdentity)[key] = childIdentity
    return
  }

  if (typeof key === 'string') {
    ensureObjectIdentityChildren(parentIdentity)[key] = childIdentity
    return
  }

  throw new Error('Child key is missing.')
}

function removeChild(
  parentValue: JsonObject | JsonArray,
  parentIdentity: JsonNodeIdentity,
  key: string | number | null,
) {
  if (typeof key === 'number') {
    if (!Array.isArray(parentValue)) {
      throw new TypeError('Target parent is not an array.')
    }

    parentValue.splice(key, 1)
    ensureArrayIdentityChildren(parentIdentity).splice(key, 1)
    return
  }

  if (typeof key === 'string') {
    if (!isJsonObject(parentValue)) {
      throw new TypeError('Target parent is not an object.')
    }

    delete parentValue[key]
    delete ensureObjectIdentityChildren(parentIdentity)[key]
    return
  }

  throw new Error('Child key is missing.')
}

function renameObjectChild(
  parentValue: JsonObject | JsonArray,
  parentIdentity: JsonNodeIdentity,
  currentKey: string,
  nextKey: string,
) {
  if (!isJsonObject(parentValue)) {
    throw new TypeError('Target parent is not an object.')
  }

  if (currentKey !== nextKey && Object.hasOwn(parentValue, nextKey)) {
    throw new Error(`Key "${nextKey}" already exists.`)
  }

  const objectEntries = Object.entries(parentValue)
  const identityEntries = Object.entries(ensureObjectIdentityChildren(parentIdentity))
  const nextObject: JsonObject = {}
  const nextIdentityChildren: Record<string, JsonNodeIdentity> = {}

  for (const [key, value] of objectEntries) {
    const outputKey = key === currentKey ? nextKey : key
    nextObject[outputKey] = value
  }

  for (const [key, value] of identityEntries) {
    const outputKey = key === currentKey ? nextKey : key
    nextIdentityChildren[outputKey] = value
  }

  for (const key of Object.keys(parentValue)) {
    delete parentValue[key]
  }

  for (const [key, value] of Object.entries(nextObject)) {
    parentValue[key] = value
  }

  parentIdentity.children = nextIdentityChildren
}

function ensureObjectIdentityChildren(
  identity: JsonNodeIdentity,
): Record<string, JsonNodeIdentity> {
  if (identity.children === undefined) {
    identity.children = {}
  }

  if (Array.isArray(identity.children)) {
    throw new TypeError('Expected object identity children.')
  }

  return identity.children
}

function ensureArrayIdentityChildren(identity: JsonNodeIdentity): JsonNodeIdentity[] {
  if (identity.children === undefined) {
    identity.children = []
  }

  if (!Array.isArray(identity.children)) {
    throw new TypeError('Expected array identity children.')
  }

  return identity.children
}

function normalizeArrayIndex(index: number, allowEnd: boolean): number {
  if (!Number.isInteger(index)) {
    throw new TypeError('Array index must be an integer.')
  }

  if (index < 0) {
    throw new RangeError('Array index must be greater than or equal to 0.')
  }

  return allowEnd ? index : Math.max(index, 0)
}

function createIdentityTree(value: JsonValue, existingId?: JsonNodeId): JsonNodeIdentity {
  if (Array.isArray(value)) {
    return {
      id: existingId ?? createJsonNodeId(),
      children: value.map(item => createIdentityTree(item)),
    }
  }

  if (isJsonObject(value)) {
    const children: Record<string, JsonNodeIdentity> = {}

    for (const [key, item] of Object.entries(value)) {
      children[key] = createIdentityTree(item)
    }

    return {
      id: existingId ?? createJsonNodeId(),
      children,
    }
  }

  return {
    id: existingId ?? createJsonNodeId(),
  }
}

function isObjectInsertInput(input: InsertInput): input is ObjectInsertInput {
  return typeof (input as ObjectInsertInput).key === 'string'
}

function isArrayItemKey(key: string | undefined): boolean {
  return key !== undefined && /^\d+$/.test(key)
}

function isSubPath(candidate: string, parentPath: string): boolean {
  if (!parentPath) {
    return candidate.length > 0
  }

  return (
    candidate === parentPath
    || candidate.startsWith(`${parentPath}.`)
    || candidate.startsWith(`${parentPath}[`)
  )
}

interface LocatedNode {
  value: JsonValue
  identity: JsonNodeIdentity
  parentValue: JsonObject | JsonArray | null
  parentIdentity: JsonNodeIdentity | null
  key: string | number | null
}

function cloneJsonValue<T extends JsonValue>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => cloneJsonValue(item)) as T
  }

  if (isJsonObject(value)) {
    const result: JsonObject = {}

    for (const [key, item] of Object.entries(value)) {
      result[key] = cloneJsonValue(item)
    }

    return result as T
  }

  return value
}

function cloneIdentityTree(identity: JsonNodeIdentity): JsonNodeIdentity {
  if (Array.isArray(identity.children)) {
    return {
      id: identity.id,
      children: identity.children.map(child => cloneIdentityTree(child)),
    }
  }

  if (identity.children) {
    const children: Record<string, JsonNodeIdentity> = {}

    for (const [key, child] of Object.entries(identity.children)) {
      children[key] = cloneIdentityTree(child)
    }

    return {
      id: identity.id,
      children,
    }
  }

  return {
    id: identity.id,
  }
}
