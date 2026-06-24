# @jsonup/vue

供 `jsonup` JSON 查看器使用的 Vue 3 适配器和组件。

## 特性

- **Vue 3 集成**：提供 `<JsonupViewer />` 组件和 `useJsonDocument` 组合式函数。
- **高性能**：内置支持通过虚拟滚动（由 `virtua` 驱动）平滑渲染 10w+ 级 JSON 节点。
- **交互性**：支持节点的展开/折叠、选中和复制。
- **高度可定制**：提供插槽，用于深度定制行、属性和值的渲染。

## 安装

```bash
npm install @jsonup/vue @jsonup/core @jsonup/themes
# 或
pnpm add @jsonup/vue @jsonup/core @jsonup/themes
# 或
yarn add @jsonup/vue @jsonup/core @jsonup/themes
```

## 基础用法

```vue
<script setup>
import { githubLight } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";

// 引入样式
import "@jsonup/vue/style.css";

const data = {
  hello: "world",
  items: [1, 2, 3],
};
</script>

<template>
  <JsonupViewer :data="data" :theme="githubLight" virtual />
</template>
```

## 文档

如需获取完整文档、API 详细信息以及更多示例，请访问 [jsonup 官方文档](https://github.com/cocoa/jsonup)。

## 许可证

[MIT](../../LICENSE)
