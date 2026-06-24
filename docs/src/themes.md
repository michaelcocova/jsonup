# Theme 预览

`@jsonup/themes` 内置了一组可直接传给 `JsonupViewer` 的主题对象，也提供了全量 `themeOptions`，适合直接做下拉、单选或预览列表。

<demo vue="./demos/themes-preview.vue" />

## 推荐用法

- 直接把主题对象传给 `JsonupViewer`
- 用 `themeOptions` 生成切换器
- 用 `findTheme(name)` 按名称查找主题

## 最小示例

```vue
<script setup lang="ts">
import { findTheme, themeOptions } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";
import { computed, ref } from "vue";

const current = ref(themeOptions[0]?.value ?? "one-light");
const theme = computed(() => findTheme(current.value));
</script>

<template>
  <select v-model="current">
    <option v-for="item in themeOptions" :key="item.value" :value="item.value">
      {{ item.label }}
    </option>
  </select>

  <JsonupViewer :data="{ hello: 'jsonup' }" :theme="theme" />
</template>
```

## 继续阅读

- Vue 示例：[`/examples/vue`](./examples/vue.md)
