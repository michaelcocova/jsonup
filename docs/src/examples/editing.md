# 结构编辑

这一页演示 `useJsonDocument()` 与 `@jsonup/operation` 的组合能力。你可以直接对节点做展开、更新、插入和移动，然后同步看到右侧 `stringify()` 输出。

<demo vue="../demos/jsonup-basic.vue" />

## 这个示例覆盖了什么

- 通过路径找到节点
- 切换容器节点展开状态
- 更新叶子节点的值
- 向对象插入新字段
- 把节点移动到新的父节点下

## 对应 API

### 主要方法

| 方法名                                   | 说明                              |
| ---------------------------------------- | --------------------------------- |
| `updateValue(document, id, value)`       | 更新叶子值或整棵子树              |
| `insert(document, parentId, input)`      | 向 object 或 array 插入子节点     |
| `remove(document, id)`                   | 删除节点                          |
| `move(document, id, parentId, options?)` | 移动节点到新的 object 或 array 下 |
| `renameKey(document, id, nextKey)`       | 重命名 object 子项                |

### 参数说明

- `InsertInput`
  - object 父节点使用 `{ key, value }`
  - array 父节点使用 `{ index?, value }`
- `MoveOptions`
  - 移入 object 时可传 `key`
  - 移入 array 时可传 `index`

## 适合继续看的页面

- 想看只读渲染：[`Viewer 基础`](./viewer.md)
- 想看大数据性能：[`10w+ 数据`](./10w.md)
