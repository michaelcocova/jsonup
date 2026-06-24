/**
 * 构建子节点的路径字符串。
 *
 * @param parentPath - 父节点的路径
 * @param childKey - 子节点的键或索引
 * @param parentIsArray - 父节点是否为数组
 * @returns 子节点的完整路径
 */
export function buildChildPath(
  parentPath: string,
  childKey: string,
  parentIsArray: boolean,
): string {
  if (parentIsArray) {
    const segment = `[${childKey}]`

    return parentPath ? `${parentPath}${segment}` : segment
  }

  return parentPath ? `${parentPath}.${childKey}` : childKey
}
