/**
 * JSONUp 核心库入口文件
 * 导出所有的类型、接口、方法和常量
 */

/**
 * 文档相关方法
 */
export { createDocument, getDocumentIdentityTree, isJsonDocument, stringify } from './document.ts'

/**
 * 节点标识相关方法
 */
export { createJsonNodeId } from './identity.ts'

/**
 * 数据规范化和类型检查方法
 */
export { isContainerValue, isJsonObject, toJsonValue } from './normalize.ts'

/**
 * 节点查询和检索方法
 */
export {
  findByPath,
  getChildren,
  getDescendants,
  getNode,
  getParent,
  getPath,
  search,
} from './query.ts'

/**
 * 状态管理相关方法
 */
export { getVisibleNodes } from './state.ts'

/**
 * 所有核心类型和接口定义
 */
export type * from './type.ts'
