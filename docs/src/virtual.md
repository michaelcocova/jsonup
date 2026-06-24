# 虚拟滚动

当 JSON 节点数量很大（例如超过 10w+ 节点）时，性能瓶颈通常不只在数据解析，更在于 DOM 的全量渲染。`jsonup` 提供了不同层次的虚拟滚动解决方案，通过只渲染视口可见范围内的节点来极大提升性能。

## 1. 使用 Vue 组件内置支持

如果你使用的是 `@jsonup/vue` 提供的 `<JsonupViewer />` 组件，开启虚拟滚动非常简单。组件内部已经深度集成了高性能虚拟列表库 [`virtua`](https://github.com/inokawa/virtua)。

你只需要添加 `virtual` 属性即可：

```vue
<script setup lang="ts">
import { JsonupViewer } from "@jsonup/vue";
import data from "./large-data.json";
</script>

<template>
  <!-- 必须为外层容器设置确定的高度，或让其自动寻找最近的滚动祖先 -->
  <div style="height: 500px; overflow-y: auto;">
    <JsonupViewer :data="data" virtual />
  </div>
</template>
```

> **原理**：当开启 `virtual` 时，`JsonupViewer` 会使用 `virtua` 的 `<Virtualizer>` 组件替代原有的普通列表渲染，它会自动向上寻找滚动容器并复用滚动视口内的 DOM 元素。

## 2. 基于 Core 模块自定义

如果你没有使用内置的 Viewer 组件，而是使用 `@jsonup/core` 配合你自己的框架（React / Svelte / Solid 等）绘制 UI，你可以利用 `visibleNodes` 配合任何第三方的虚拟列表库来实现。

### 数据层：只获取可见节点

`createDocument()`（或 Vue 中的 `useJsonDocument()`）计算出的状态中包含 `visibleNodes`：

```ts
const state = useJsonDocument(data);

// visibleNodes 只包含未被父节点折叠隐藏的、需要被实际渲染的平铺节点列表
const rows = computed(() => state.visibleNodes.value);
```

折叠节点时，其隐藏的子树不会进入 `visibleNodes`。这不仅能减少虚拟列表需要管理的数据量，也能避免 UI 层去处理“看不见”的逻辑。

### 视图层：只渲染视口行

以 Vue 和 `virtua/vue` 的 `<VList>` 为例：

```vue
<script setup lang="ts">
import { VList } from "virtua/vue";
</script>

<template>
  <VList :data="rows" :style="{ height: '420px' }">
    <template #default="{ item }">
      <div class="tree-row">
        {{ item.path }}
      </div>
    </template>
  </VList>
</template>
```

虚拟滚动负责根据滚动位置复用 DOM，`jsonup` 负责提供稳定的节点 id、路径和展开态。两者结合后，10w+ 节点也不需要一次性挂载到页面。

## 3. 性能优化建议

### 保持稳定行高

树列表最好保持稳定的 CSS 行高：

```css
.tree-row {
  height: 32px;
  min-height: 32px;
}
```

稳定的行高能大幅减少虚拟列表引擎在滚动时的动态测量成本，也能避免节点展开、选中、hover 时出现明显的布局跳动。

### 节点 ID 的稳定性

`jsonup` 内部通过 `identityTree` 保证了节点展开、收起等操作只会改变节点的 `expanded` 状态，而不会重建树的整体结构和节点的唯一 `id`。这种稳定的 id 机制可以让虚拟列表完美复用已有的 DOM 行，减少无意义的重新挂载开销。
