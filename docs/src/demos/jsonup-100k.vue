<script setup lang="ts">
import type {
  JsonArray,
  JsonNodeId,
  JsonObject,
} from '@jsonup/core'
import { useJsonDocument } from '@jsonup/vue'
import { computed, ref } from 'vue'
import JsonTreeView from './components/JsonTreeView.vue'

/**
 * 生成压力测试数据的选项
 */
export interface GenerateStressTestDataOptions {
  /** 期望的最小节点数 */
  minNodes?: number
  /** 根节点的类型 */
  rootType?: 'array' | 'object'
  /** 每个数组/对象包含的属性或元素数量 */
  tagsPerItem?: number
}

/**
 * 生成的压力测试数据结果
 */
export interface GeneratedStressTestData {
  /** 生成的原始 JSON 数据 */
  raw: JsonObject | JsonArray
  /** 预估生成的节点总数 */
  estimatedNodes: number
  /** 生成的项目总数 */
  itemCount: number
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

const startedAt = performance.now()
const generated = generateStressTestData({
  minNodes: 100_000,
  rootType: 'array',
})
const state = useJsonDocument(generated.raw)
const setupMs = (performance.now() - startedAt).toFixed(1)
const selectedId = ref<JsonNodeId | null>(null)

const stats = computed(() => ({
  itemCount: generated.itemCount,
  estimatedNodes: generated.estimatedNodes,
  totalNodes: state.document.value.nodes.length,
  visibleRows: state.visibleNodes.value.length,
  setupMs,
}))

const items = computed(() =>
  state.visibleNodes.value.map(node => ({
    id: node.id,
    level: node.depth,
    title: node.key ?? '(root)',
    path: node.path || '(root)',
    type: node.type,
    value: node.leaf ? String(node.value) : `${node.children} children`,
    hasChildren() {
      return node.expandable
    },
    isExpanded() {
      return Boolean(node.expanded)
    },
    toggleExpand() {
      state.toggleExpanded(node.id)
    },
  })),
)

const selectedNode = computed(() =>
  selectedId.value ? state.getNode(selectedId.value) : undefined,
)

function selectNode(id: JsonNodeId) {
  selectedId.value = id
}

function expandFirstRows(count: number) {
  for (const item of items.value.slice(0, count)) {
    if (item.hasChildren() && !item.isExpanded()) {
      item.toggleExpand()
    }
  }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="expandFirstRows(10)"
      >
        展开前 10 行
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="expandFirstRows(50)"
      >
        展开前 50 行
      </button>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      <div class="grid gap-1 rounded-xl border border-slate-200 bg-white p-3">
        <strong class="text-lg font-semibold text-slate-900">{{ stats.itemCount }}</strong>
        <span class="text-xs text-zinc-500">items</span>
      </div>
      <div class="grid gap-1 rounded-xl border border-slate-200 bg-white p-3">
        <strong class="text-lg font-semibold text-slate-900">{{ stats.estimatedNodes }}</strong>
        <span class="text-xs text-zinc-500">estimated nodes</span>
      </div>
      <div class="grid gap-1 rounded-xl border border-slate-200 bg-white p-3">
        <strong class="text-lg font-semibold text-slate-900">{{ stats.totalNodes }}</strong>
        <span class="text-xs text-zinc-500">parsed nodes</span>
      </div>
      <div class="grid gap-1 rounded-xl border border-slate-200 bg-white p-3">
        <strong class="text-lg font-semibold text-slate-900">{{ stats.visibleRows }}</strong>
        <span class="text-xs text-zinc-500">visible rows</span>
      </div>
      <div class="grid gap-1 rounded-xl border border-slate-200 bg-white p-3">
        <strong class="text-lg font-semibold text-slate-900">{{ stats.setupMs }} ms</strong>
        <span class="text-xs text-zinc-500">setup time</span>
      </div>
    </div>

    <div class="grid gap-4 min-[960px]:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <section class="overflow-hidden rounded-xl border border-slate-200 p-4">
        <h3 class="mb-3 text-base font-semibold text-slate-900">
          10w Tree Rows
        </h3>
        <JsonTreeView
          :items="items"
          :selected-id="selectedId"
          max-height="420px"
          @select="selectNode"
        />
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200 p-4">
        <h3 class="mb-3 text-base font-semibold text-slate-900">
          Selected Node
        </h3>
        <pre class="m-0 overflow-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-200">{{
          selectedNode ?? { message: "点击左侧任意节点查看详情" }
        }}</pre>
      </section>
    </div>
  </div>
</template>
