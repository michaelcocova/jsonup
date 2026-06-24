---
outline: [2, 3, 4]
---

# 快速开始

`jsonup` 的使用可以分成两步：

1. 用 `@jsonup/core` 把对象、数组或 JSON 字符串转换成 `JsonDocument`
2. 在需要交互、修改结构或渲染界面时，再接入 `@jsonup/operation` 或 `@jsonup/vue`

`jsonup` 的三个核心包分别负责不同的事情：

- `@jsonup/core`：创建文档、查节点、查路径、管理展开状态、输出 JSON
- `@jsonup/operation`：增删改查、移动节点、重命名 key
- `@jsonup/vue`：响应式状态、`JsonupViewer`、插槽和主题接入

## 安装

### 基础JS/TS 中

> 安装核心包 `@jsonup/core`：

::: code-group

```sh [pnpm]
pnpm add @jsonup/core
```

```sh [yarn]
yarn add @jsonup/core
```

```sh [npm]
npm install @jsonup/core
```

```sh [bun]
bun add @jsonup/core
```

:::

::: tip 需要操作文档结构

安装操作包 `@jsonup/operation`：
:::

::: code-group

```sh [pnpm]
pnpm add @jsonup/operation
```

```sh [yarn]
yarn add @jsonup/operation
```

```sh [npm]
npm install @jsonup/operation
```

```sh [bun]
bun add @jsonup/operation
```

:::

### Vue 中

::: tip Vue 中使用 `JsonupViewer`
如果你要在 Vue 里使用，再安装`@jsonup/operation`, `@jsonup/vue` 和 `@jsonup/themes`：
:::

::: code-group

```sh [pnpm]
pnpm add @jsonup/operation @jsonup/vue @jsonup/themes
```

```sh [yarn]
yarn add @jsonup/operation @jsonup/vue @jsonup/themes
```

```sh [npm]
npm install @jsonup/vue @jsonup/themes
```

```sh [bun]
bun add @jsonup/vue @jsonup/themes
```

:::

## 快速上手

最短路径是先创建文档，再围绕文档对象工作：

```ts
import { createDocument } from "@jsonup/core";

const document = createDocument(
  {
    name: "jsonup",
    scripts: {
      dev: "vp dev",
      build: "vp build",
    },
  },
  {
    expandable: true,
    defaultExpandedDepth: 1,
  },
);

console.log(document.type); // "object-json"
console.log(document.nodes.length);
console.log(document.visibleNodes.map((node) => node.path));
console.log(document.stringify(2));
```

`createDocument()` 返回的不是普通对象，而是一个带行为的 `JsonDocument`：

- 有 `nodes`
- 有 `visibleNodes`
- 有 `findByPath()`、`getNode()`、`search()`
- 有 `toggleExpanded()`
- 有 `stringify()`

## 第一步：创建文档

`createDocument()` 支持对象、数组和 JSON 字符串。

```ts
import { createDocument } from "@jsonup/core";

const objectDocument = createDocument({
  name: "jsonup",
  scripts: {
    dev: "vp dev",
  },
});

const arrayDocument = createDocument([
  { name: "jsonup" },
  { name: "vite-plus" },
]);

const stringDocument = createDocument(`{"name":"jsonup","version":"0.1.0"}`);
```

创建完成后，文档会被展开成一组扁平节点。每个节点都有：

- `id`
- `path`
- `depth`
- `parent`
- `type`
- `expanded`

这种结构更适合做树视图、搜索、定位、窗口裁剪和大数据渲染。

## 第二步：查询节点和路径

最常用的是按路径查节点，然后再从节点继续查父子关系。

```ts
import { createDocument } from "@jsonup/core";

const document = createDocument({
  scripts: {
    dev: "vp dev",
    build: "vp build",
  },
});

const scriptsNode = document.findByPath("scripts");
const devNode = document.findByPath("scripts.dev");

if (scriptsNode && devNode) {
  console.log(document.getPath(devNode.id)); // "scripts.dev"
  console.log(document.getParent(devNode.id));
  console.log(document.getChildren(scriptsNode.id));
  console.log(document.getDescendants(scriptsNode.id));
}
```

路径规则很简单：

- 对象字段使用点号，比如 `scripts.dev`
- 数组项使用方括号，比如 `[0].name`
- 根节点路径始终是空字符串 `""`

## 第三步：控制展开状态

展开状态已经在 core 文档对象内部，不需要额外状态层也可以工作。

```ts
import { createDocument } from "@jsonup/core";

const document = createDocument(
  {
    scripts: {
      dev: "vp dev",
      build: "vp build",
    },
  },
  {
    expandable: true,
  },
);

const scriptsNode = document.findByPath("scripts");

if (scriptsNode) {
  document.toggleExpanded(scriptsNode.id, true);
  console.log(document.visibleNodes.map((node) => node.path));

  document.toggleExpanded(scriptsNode.id, false);
  console.log(document.visibleNodes.map((node) => node.path));
}
```

如果你希望默认展开，可以在创建文档时传这些选项：

- `expandable`
- `defaultExpandedAll`
- `defaultExpandedDepth`

其中 `defaultExpandedDepth` 的优先级高于 `defaultExpandedAll`。

## 第四步：修改结构

文档结构修改通过 `@jsonup/operation` 完成，所有方法都会返回新的 `JsonDocument`。

```ts
import { createDocument } from "@jsonup/core";
import { insert, move, renameKey, updateValue } from "@jsonup/operation";

let document = createDocument({
  scripts: {
    dev: "vp dev",
  },
  commands: {},
});

const scriptsNode = document.findByPath("scripts");
const devNode = document.findByPath("scripts.dev");
const commandsNode = document.findByPath("commands");

if (scriptsNode) {
  document = insert(document, scriptsNode.id, {
    key: "preview",
    value: "vp preview",
  });
}

if (devNode) {
  document = updateValue(document, devNode.id, "npm run dev");
  document = renameKey(document, devNode.id, "start");
}

const startNode = document.findByPath("scripts.start");

if (startNode && commandsNode) {
  document = move(document, startNode.id, commandsNode.id, {
    key: "dev",
  });
}
```

`@jsonup/operation` 常用方法：

- `updateValue()`
- `insert()`
- `remove()`
- `move()`
- `renameKey()`

## 第五步：在 Vue 中使用

如果你需要响应式状态和界面交互，就接入 `@jsonup/vue`。

```ts
import { useJsonDocument } from "@jsonup/vue";

const state = useJsonDocument(
  {
    scripts: {
      dev: "vp dev",
      build: "vp build",
    },
  },
  {
    defaultExpandedDepth: 1,
  },
);

const scriptsNode = state.findByPath("scripts");

if (scriptsNode) {
  state.toggleExpanded(scriptsNode.id);
}
```

`useJsonDocument()` 会把这些能力组织成响应式状态：

- `document`
- `nodes`
- `visibleNodes`
- `expandedPaths`
- `state`
- `toggleExpanded()`
- `updateValue()` / `insert()` / `remove()` / `move()` / `renameKey()`

## 第六步：渲染 Viewer

`JsonupViewer` 适合做只读展示，也可以直接接收 `JsonDocument`。

```vue
<script setup lang="ts">
import { createDocument } from "@jsonup/core";
import { GithubLight } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";

const document = createDocument(
  {
    name: "jsonup",
    scripts: {
      dev: "vp dev",
    },
  },
  {
    expandable: true,
    defaultExpandedDepth: 1,
  },
);
</script>

<template>
  <JsonupViewer :data="document" :line-numbers="true" :theme="GithubLight" />
</template>
```

如果你只想直接渲染普通对象，也可以传原始数据：

```vue
<JsonupViewer :data="{ hello: 'jsonup' }" />
```

## 下一步看什么

- 想专门看核心能力：[`/examples/core`](../examples/core.md)
- 想专门看 Vue 接入：[`/examples/vue`](../examples/vue.md)
- 想看 10w+ 数据场景：[`/examples/10w`](../examples/10w.md)

你可以参考 [示例总览](./../examples/index.md) 或具体的模块示例来进一步了解用法。
