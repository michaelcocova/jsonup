# Viewer 基础

`JsonupViewer` 适合做只读 JSON 展示。最常见的用法就是传入对象或数组，并通过 `expandedPaths` 指定默认展开路径。

<demo vue="../demos/jsonup-viewer-basic.vue" />

## 适合的场景

- 文档里的 JSON 只读预览
- 配置编辑器右侧的结构预览
- 大 JSON 的浏览入口

## 常用参数

- `data`：传入对象、数组，或者 `parse()` 后得到的 `JsonDocument`
- `expandedPaths`：指定默认展开的路径，比如 `scripts`、`repository`
- `showLineNumbers`：控制是否显示行号
- `theme`：传入 `@jsonup/themes` 导出的主题对象

## 最小示例

```vue
<script setup lang="ts">
import { OneLight } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";

const data = {
  name: "jsonup",
  version: "0.1.0",
  scripts: {
    dev: "vp dev",
    build: "vp build",
  },
};
</script>

<template>
  <JsonupViewer
    :data="data"
    :expanded-paths="['scripts']"
    :show-line-numbers="true"
    :theme="OneLight"
  />
</template>
```
