# @jsonup/core

`jsonup` 生态系统的核心 JSON 解析器、状态管理器和文档构建器。

## 特性

- **纯 TypeScript**：框架无关，可在浏览器和 Node.js 环境中运行。
- **身份树 (Identity Tree)**：自动跟踪和维护更新前后的节点身份，允许 UI 状态（如展开/折叠）在 JSON 数据改变时保持持久化。
- **路径解析**：内置支持路径解析和 JSON 树搜索。
- **惰性求值 (Lazy Evaluation)**：专为高性能设计，即使面对海量 JSON 结构也能从容应对。

## 安装

```bash
npm install @jsonup/core
# 或
pnpm add @jsonup/core
# 或
yarn add @jsonup/core
```

## 基础用法

```ts
import { createDocument } from "@jsonup/core";

const data = {
  hello: "world",
  items: [1, 2, 3],
};

const doc = createDocument(data, {
  defaultExpandedRoot: true,
});

console.log(doc.nodes); // 准备好被渲染的扁平 JSON 节点列表
```

## 许可证

## 许可证

[MIT](../../LICENSE)
