# 在 Vue 中使用

## 基础用法

最常见的组合是 `useJsonDocument()` 提供响应式文档状态，`JsonupViewer` 负责渲染。

<demo vue="../demos/jsonup-viewer-basic.vue" />

## 显示行号

通过 `lineNumbers` 传入 `true` 来显示行号。

<demo vue="../demos/jsonup-viewer-line-numbers.vue" />

```vue
<script setup lang="ts">
import { GithubLight } from "@jsonup/themes";
import { JsonupViewer } from "@jsonup/vue";

const data = {
  name: "jsonup",
  scripts: {
    dev: "vp dev",
  },
};
</script>

<template>
  <JsonupViewer
    :data="data"
    :expanded-paths="['scripts']"
    :line-numbers="true"
    :theme="GithubLight"
  />
</template>
```

## 展开与收起

`useJsonDocument()` 提供了 `toggleExpanded()`，适合树视图或编辑器场景。

```ts twoslash
import { useJsonDocument } from "@jsonup/vue";

const state = useJsonDocument({
  scripts: {
    dev: "vp dev",
    build: "vp build",
  },
});

const scriptsNode = state.findByPath("scripts");

if (scriptsNode) {
  state.toggleExpanded(scriptsNode.id, true);
  state.toggleExpanded(scriptsNode.id, false);
  state.toggleExpanded(scriptsNode.id);
}
```

## 默认展开

默认展开通过 `expandedPaths` 传入。

```ts twoslash
import { useJsonDocument } from "@jsonup/vue";

const state = useJsonDocument(
  {
    scripts: {
      dev: "vp dev",
    },
    repository: {
      type: "git",
      url: "https://github.com/cocoa/jsonup",
    },
  },
  {
    expandedPaths: ["scripts", "repository"],
  },
);
```

## 自定义节点

`JsonupViewer` 提供了 `line`、`open`、`property`、`close`、`collapsed`、`lineNumber` 这些 slot，可以覆盖默认渲染。

```vue
<script setup lang="ts">
import { JsonupViewer } from "@jsonup/vue";

const data = {
  scripts: {
    dev: "vp dev",
  },
};
</script>

<template>
  <JsonupViewer :data="data">
    <template #property="{ line, text }">
      <span class="custom-line">
        <strong>{{ line.node.path }}</strong>
        <span>{{ text }}</span>
      </span>
    </template>
  </JsonupViewer>
</template>
```

## 自定义主题

除了直接传入内置主题，也可以用 `defineTheme()` 自定义一套配色。

<demo vue="../demos/themes-preview.vue" />

```ts twoslash
import { defineTheme } from "@jsonup/themes";

export const CatppuccinMocha = defineTheme("catppuccin-mocha", "dark", {
  background: "#1E1E2E",
  foreground: "#CDD6F4",
  lineNumber: "#6C7086",
  summary: "#A6ADC8",
  property: "#89B4FA",
  string: "#A6E3A1",
  number: "#F9E2AF",
  boolean: "#FAB387",
  null: "#F38BA8",
  punctuation: "#BAC2DE",
});
```

## Api

### 属性

`JsonupViewer` 常用属性：

| 属性名                 | 类型                        | 默认值      | 说明                                                                                         |
| ---------------------- | --------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `data`                 | `JsonInput \| JsonDocument` | 必填        | 数据源，支持传入普通对象、数组，或者通过 `createDocument` / `useJsonDocument` 生成的文档对象 |
| `defaultExpandedRoot`  | `boolean`                   | `true`      | 是否默认展开根节点                                                                           |
| `defaultExpandedAll`   | `boolean`                   | `false`     | 是否默认展开所有节点                                                                         |
| `defaultExpandedDepth` | `number \| true`            | `undefined` | 默认展开层级，传入 `true` 表示展开所有                                                       |
| `expandedPaths`        | `Iterable<string>`          | `undefined` | 默认展开的路径集合                                                                           |
| `lineNumbers`          | `boolean`                   | `false`     | 是否显示行号                                                                                 |
| `theme`                | `JsonupTheme`               | `undefined` | 主题对象，通常从 `@jsonup/themes` 引入                                                       |
| `virtual`              | `boolean`                   | `false`     | 是否启用虚拟列表模式，自动优化超大数据量下的渲染性能（底层基于 `virtua` 实现）               |
| `identityTree`         | `JsonNodeIdentity`          | `undefined` | 用于状态恢复的节点标识树                                                                     |
| `cloneRaw`             | `boolean`                   | `false`     | 是否克隆原始输入数据                                                                         |

`useJsonDocument()` 返回的响应式状态：

| 状态名          | 说明                                                 |
| --------------- | ---------------------------------------------------- |
| `document`      | 当前的 `JsonDocument` 实例                           |
| `nodes`         | 解析出的全部 `JsonNode` 节点集合                     |
| `visibleNodes`  | 根据节点展开状态计算出来的可见节点列表（供渲染使用） |
| `expandedPaths` | 当前所有已展开节点的路径集合                         |
| `state`         | 包含上述响应式状态与操作方法的完整对象               |

### 方法

`useJsonDocument()` 提供的方法：

| 方法名                          | 说明               |
| ------------------------------- | ------------------ |
| `setDocument(nextInput)`        | 设置新的文档数据   |
| `reset(nextInput)`              | 重置文档状态和数据 |
| `toggleExpanded(id, expanded?)` | 切换节点展开状态   |
| `updateValue(id, value)`        | 更新节点值         |
| `insert(id, input)`             | 插入子节点         |
| `remove(id)`                    | 删除节点           |
| `move(id, parentId, options?)`  | 移动节点到新父节点 |
| `renameKey(id, nextKey)`        | 重命名对象键       |
| `getNode(id)`                   | 根据 ID 获取节点   |
| `getPath(id)`                   | 根据 ID 获取路径   |
| `findByPath(path)`              | 根据路径查找节点   |
| `search(query)`                 | 搜索节点           |
| `stringify(space?)`             | 输出 JSON 字符串   |
