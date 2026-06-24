# 什么是 jsonup？

`jsonup` 是一个面向 JSON 编辑器、配置面板和数据查看器的文档模型库。它把对象或数组形式的 JSON 转成扁平的节点列表，让树形 UI、搜索、路径定位和结构编辑可以围绕同一份 `JsonDocument` 工作。

核心目标是把 JSON 的“树结构”拆成更容易渲染和操作的节点：

```ts
interface JsonDocument {
  type: "object-json" | "array-json";
  raw: object | unknown[];
  nodes: JsonNode[];
}
```

每个节点会记录自己的父级、深度、路径、类型、子节点数量和子树大小。这样 UI 不需要反复递归原始 JSON，就可以快速得到当前行、父子关系和折叠状态。

## 适合什么场景？

- JSON 配置编辑器
- 大 JSON 查看器
- 树形数据搜索和定位
- 支持插入、删除、移动、重命名的结构化编辑
- Vue 中带展开态和可见行计算的 JSON tree

## 包组成

- `@jsonup/core`：解析 JSON、生成节点、查询路径、搜索和 stringify。
- `@jsonup/operation`：提供更新值、插入、删除、移动、重命名等结构操作。
- `@jsonup/vue`：把文档状态、展开态、可见节点和操作方法封装成 Vue composable。

## 当前边界

`jsonup` 当前面向 JSON 原生数据模型：object、array、string、number、boolean、null。它不会扩展 JSON 语法，也不会保留重复 key。

对于 big number 和高精度小数，`jsonup` 内部会保留为 `Decimal`，这样在查询、展示、编辑和 `stringify()` 时都不会丢掉数值精度。
