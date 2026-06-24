# JSON UP

一个高性能、高可定制性且框架无关的 JSON 查看器与编辑器生态系统。

## 核心包

本仓库是一个由 [Turborepo](https://turborepo.org/) 和 [pnpm](https://pnpm.io/) 管理的 Monorepo，包含以下核心包：

| 包名                                        | 描述                                           |
| ------------------------------------------- | ---------------------------------------------- |
| [`@jsonup/core`](./packages/core)           | 核心 JSON 解析器、状态管理器与文档构建器。     |
| [`@jsonup/operation`](./packages/operation) | 不可变 JSON 树操作（插入、删除、更新、移动）。 |
| [`@jsonup/themes`](./packages/themes)       | 主题系统与 CSS 变量。                          |
| [`@jsonup/vue`](./packages/vue)             | 供 Vue 3 使用的 JSON 查看器适配器与组件。      |

## 特性

- **高性能**：专为轻松处理大型 JSON 文档而设计。内置虚拟滚动支持。
- **框架无关核心**：核心逻辑由纯 TypeScript 编写，可集成至任意 UI 框架。
- **状态保持**：使用内部的 `IdentityTree`（身份树）来维持节点状态（如展开/折叠），即使底层数据发生变化或执行了操作也能保持不变。
- **高度可定制**：支持通过 CSS 变量进行完整的主题定制，并提供基于插槽的节点自定义渲染。

## 文档

如需查看完整文档与示例，请访问我们的[文档站点](https://github.com/cocoa/jsonup)（或在本地运行 `pnpm run docs:dev`）。

## 开发指南

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build

# 运行测试
pnpm run test

# 在本地启动文档站点
pnpm run dev
```

## 许可证

[MIT](./LICENSE)
