# @jsonup/operation

供 `jsonup` 生态系统使用的不可变 JSON 树操作库。

## 特性

- **不可变更新**：安全地操作 JSON 文档，而无需修改原始对象。
- **保持身份 (Identity Preservation)**：当节点被更新、插入、移动或删除时，内部的 `IdentityTree` 会被保留，确保 UI 状态不会发生跳动或重置。
- **全面的 API**：支持更新值、插入元素、删除节点、跨父级移动节点以及重命名键。

## 安装

```bash
npm install @jsonup/operation
# 或
pnpm add @jsonup/operation
# 或
yarn add @jsonup/operation
```

## 基础用法

```ts
import { createDocument } from "@jsonup/core";
import { insert, remove, updateValue } from "@jsonup/operation";

const doc = createDocument({ a: 1, b: 2 });

// 更新值
const nextDoc = updateValue(doc, "node-id-of-a", 42);

// 插入新节点
const docWithInsert = insert(doc, "node-id-of-root", { c: 3 });

// 删除节点
const docWithoutB = remove(doc, "node-id-of-b");
```

## 许可证

[MIT](../../LICENSE)
