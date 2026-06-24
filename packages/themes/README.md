# @jsonup/themes

供 `jsonup` 生态系统使用的主题系统和 CSS 变量。

## 特性

- **亮色与暗色模式**：内置支持亮色（Light）和暗色（Dark）主题。
- **高度可定制**：易于使用 CSS 变量进行扩展或覆盖。
- **GitHub 主题**：开箱即用，内置了 GitHub Light 和 GitHub Dark 主题。

## 安装

```bash
npm install @jsonup/themes
# 或
pnpm add @jsonup/themes
# 或
yarn add @jsonup/themes
```

## 基础用法

搭配 `@jsonup/vue` 使用：

```vue
<script setup>
import { githubDark } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";
</script>

<template>
  <JsonupViewer :data="{}" :theme="githubDark" />
</template>
```

## 许可证

[MIT](../../LICENSE)
