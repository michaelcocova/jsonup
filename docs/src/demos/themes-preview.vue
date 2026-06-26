<script setup lang="ts">
import type { JsonObject } from '@jsonup/core'
import type { GeneratedStressTestData, GenerateStressTestDataOptions } from './jsonup-100k.vue'
import { findTheme, themeOptions } from '@jsonup/themes'
import { JsonupViewer } from '@jsonup/vue'
import { computed, onMounted, ref } from 'vue'
import '@jsonup/vue/style.css'

const current = ref('one-light')

const theme = computed(() => findTheme(current.value))

function handleChange(theme: string) {
  current.value = theme
}
function generateStressTestData(
  options: GenerateStressTestDataOptions = {},
): GeneratedStressTestData {
  const minNodes = options.minNodes ?? 100_000
  const rootType = options.rootType ?? 'array'
  const tagsPerItem = Math.max(1, options.tagsPerItem ?? 3)
  const rootNodes = rootType === 'array' ? 1 : 2
  const nodesPerItem = 11 + tagsPerItem
  const itemCount = Math.max(1, Math.ceil(Math.max(0, minNodes - rootNodes) / nodesPerItem))
  const items = Array.from({ length: itemCount }, (_, index) =>
    createStressTestItem(index, tagsPerItem))
  const raw = rootType === 'array' ? items : { items }

  return {
    raw,
    estimatedNodes: rootNodes + itemCount * nodesPerItem,
    itemCount,
  }
}

function createStressTestItem(index: number, tagsPerItem: number): JsonObject {
  return {
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user-${index + 1}@example.com`,
    active: index % 2 === 0,
    score: index % 100,
    meta: {
      createdAt: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
      updatedAt: `2026-02-${String((index % 28) + 1).padStart(2, '0')}T12:00:00Z`,
      region: `region-${index % 10}`,
    },
    tags: Array.from(
      { length: tagsPerItem },
      (_, tagIndex) => `tag-${tagIndex + 1}-${index % 100}`,
    ),
  }
}
const data = generateStressTestData({
  minNodes: 100_000,
  rootType: 'array',
})
// const data = {
//   name: 'jsonup',
//   version: '0.0.0',
//   private: true,
//   type: 'module',
//   scripts: {
//     ready: 'vp check && vp run -r test && vp run -r build',
//     dev: 'vp run docs:dev',
//     prepare: 'vp config',
//   },
//   devDependencies: {
//     '@jsonup/core': 'workspace:*',
//     '@jsonup/themes': 'workspace:*',
//     '@jsonup/operation': 'workspace:*',
//     'vite-plus': 'catalog:',
//   },
//   engines: {
//     node: '>=22.12.0',
//   },
//   packageManager: 'pnpm@11.6.0',
// }
onMounted(() => {
  // 自动滚动到当前主题
  const radio = document.querySelector(`input[value="${current.value}"]`)
  if (radio) {
    radio.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    })
  }
})
</script>

<template>
  <div class="flex items-stretch gap-3">
    <fieldset class="basis-xs max-h-96 overflow-y-auto grid items-center gap-1 rounded-xl border border-slate-200 p-3">
      <legend class="inline-block bg-white px-2 text-sm font-medium text-slate-700">
        主题
      </legend>
      <label
        v-for="item in themeOptions" :key="item.value"
        class="cursor-pointer rounded px-2 py-0.5 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-100"
      >
        <input
          type="radio" :checked="current === item.value" name="theme" :value="item.value" class="mr-1.5"
          @change="() => handleChange(item.value)"
        >
        {{ item.label }}
      </label>
    </fieldset>
    <fieldset class="rounded-xl flex-1 max-h-96 border border-slate-200 p-3">
      <legend class="inline-block bg-white px-2 text-sm font-medium text-slate-700">
        预览
      </legend>
      <JsonupViewer
        :data="(data as any)"
        virtual
        word-wrap
        line-numbers
        :theme="theme"
      />
    </fieldset>
  </div>
</template>
