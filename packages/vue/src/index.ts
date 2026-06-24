import type { CreateDocumentOptions, JsonDocument, JsonInput, JsonNodeId } from '@jsonup/core'
import type { InsertInput, MoveOptions } from '@jsonup/operation'
import {
  createDocument,
  isJsonDocument,
} from '@jsonup/core'
import {
  insert as insertNode,
  move as moveNode,
  remove as removeNode,
  renameKey as renameNodeKey,
  updateValue as updateNodeValue,
} from '@jsonup/operation'
import { computed, shallowRef, triggerRef } from 'vue'

export {
  JsonupViewer,
  type JsonupViewerLineSlotProps,
} from './JsonupViewer.js'
export {
  createViewerLines,
  type JsonupViewerLine,
  type JsonupViewerLineKind,
} from './viewer-lines.js'

/**
 * useJsonDocument 组合式函数的选项接口
 */
export interface UseJsonDocumentOptions extends CreateDocumentOptions {}

/**
 * 用于管理和操作 JSON 文档的 Vue 组合式函数
 * @param input 初始 JSON 输入数据或已存在的 JSON 文档
 * @param options 创建文档时的配置选项
 * @returns 包含文档状态和一系列操作方法的对象
 */
export function useJsonDocument(
  input: JsonInput | JsonDocument,
  options: UseJsonDocumentOptions = {},
) {
  const document = shallowRef(createDocument(input, options))
  const visibleNodes = computed(() => document.value.visibleNodes)

  function setDocument(nextInput: JsonInput | JsonDocument): JsonDocument {
    document.value = createDocument(nextInput, options)
    return document.value
  }

  function refresh(nextDocument: JsonDocument): JsonDocument {
    document.value = isJsonDocument(nextDocument)
      ? nextDocument
      : createDocument(nextDocument, options)
    return document.value
  }

  function toggleExpanded(id: JsonNodeId, expanded?: boolean): JsonDocument {
    document.value.toggleExpanded(id, expanded)
    triggerRef(document)
    return document.value
  }

  function updateValue(id: JsonNodeId, value: unknown): JsonDocument {
    return refresh(updateNodeValue(document.value, id, value))
  }

  function insert(id: JsonNodeId, inputValue: InsertInput): JsonDocument {
    return refresh(insertNode(document.value, id, inputValue))
  }

  function remove(id: JsonNodeId): JsonDocument {
    return refresh(removeNode(document.value, id))
  }

  function move(id: JsonNodeId, parentId: JsonNodeId, options?: MoveOptions): JsonDocument {
    return refresh(moveNode(document.value, id, parentId, options))
  }

  function renameKey(id: JsonNodeId, nextKey: string): JsonDocument {
    return refresh(renameNodeKey(document.value, id, nextKey))
  }

  function reset(nextInput: JsonInput | JsonDocument): JsonDocument {
    return setDocument(nextInput)
  }

  return {
    /** 当前的 JSON 文档对象 */
    document,
    /** 文档中的所有节点列表 */
    nodes: computed(() => document.value.nodes),
    /** 当前处于可见状态的节点列表（父节点已展开的节点） */
    visibleNodes,
    /** 当前已展开节点的路径集合 */
    expandedPaths: computed(() => new Set(document.value.state.expandedPaths)),
    /**
     * 设置新的文档数据
     * @param nextInput 新的 JSON 输入数据或文档
     * @returns 新创建的 JSON 文档对象
     */
    setDocument,
    /**
     * 重置文档数据（等同于 setDocument）
     * @param nextInput 新的 JSON 输入数据或文档
     * @returns 新创建的 JSON 文档对象
     */
    reset,
    /** 文档的当前内部状态 */
    state: computed(() => document.value.state),
    /**
     * 切换指定节点的展开/折叠状态
     * @param id 节点 ID
     * @param expanded 可选的强制状态，true 为展开，false 为折叠
     * @returns 更新后的 JSON 文档对象
     */
    toggleExpanded,
    /**
     * 更新指定节点的值
     * @param id 节点 ID
     * @param value 新的节点值
     * @returns 更新后的 JSON 文档对象
     */
    updateValue,
    /**
     * 在指定位置插入新节点
     * @param id 目标节点 ID
     * @param inputValue 要插入的输入值配置
     * @returns 更新后的 JSON 文档对象
     */
    insert,
    /**
     * 移除指定节点
     * @param id 节点 ID
     * @returns 更新后的 JSON 文档对象
     */
    remove,
    /**
     * 移动节点到新的父节点下
     * @param id 要移动的节点 ID
     * @param parentId 目标父节点 ID
     * @param options 移动操作的高级选项
     * @returns 更新后的 JSON 文档对象
     */
    move,
    /**
     * 重命名节点键名（仅针对对象属性）
     * @param id 节点 ID
     * @param nextKey 新的键名
     * @returns 更新后的 JSON 文档对象
     */
    renameKey,
    /**
     * 根据 ID 获取节点
     * @param id 节点 ID
     * @returns 匹配的节点对象，不存在时抛出错误或返回 null（取决于核心实现）
     */
    getNode: (id: JsonNodeId) => document.value.getNode(id),
    /**
     * 根据 ID 获取节点的 JSONPath 路径
     * @param id 节点 ID
     * @returns 节点的路径字符串
     */
    getPath: (id: JsonNodeId) => document.value.getPath(id),
    /**
     * 根据 JSONPath 路径查找节点
     * @param path JSONPath 路径字符串
     * @returns 匹配的节点对象，不存在时返回 undefined
     */
    findByPath: (path: string) => document.value.findByPath(path),
    /**
     * 在文档中搜索匹配的节点
     * @param query 搜索关键字
     * @returns 匹配的节点 ID 数组
     */
    search: (query: string) => document.value.search(query),
    /**
     * 将当前文档状态格式化为 JSON 字符串
     * @param space 缩进的空格数，默认为 2
     * @returns 格式化后的 JSON 字符串
     */
    stringify: (space?: number) => document.value.stringify(space),
  }
}
