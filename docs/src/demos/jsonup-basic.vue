<script setup lang="ts">
import { createDocument } from '@jsonup/core'
import { useJsonDocument } from '@jsonup/vue'
import { computed, ref } from 'vue'
import JsonTreeView from './components/JsonTreeView.vue'

const state = useJsonDocument({
  scripts: {
    dev: 'vp dev',
  },
  commands: {},
})

const document = createDocument({
  name: 'jsonup',
  scripts: {
    dev: 'vp dev',
  },
})

const selectedId = ref<string | null>(null)

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

const output = computed(() => state.stringify(2))

const api = {
  inputNodeClick(id: string) {
    selectedId.value = id
  },
}

function toggleScripts() {
  const scriptsNode = state.findByPath('scripts')

  if (scriptsNode) {
    state.toggleExpanded(scriptsNode.id)
  }
}

function updateDev() {
  const devNode = state.findByPath('scripts.dev')

  if (devNode) {
    state.updateValue(devNode.id, 'npm run dev')
  }
}

function insertPreview() {
  const scriptsNode = state.findByPath('scripts')

  if (scriptsNode && !state.findByPath('scripts.preview')) {
    state.insert(scriptsNode.id, {
      key: 'preview',
      value: 'vp preview',
    })
  }
}

function moveDev() {
  const devNode = state.findByPath('scripts.dev')
  const commandsNode = state.findByPath('commands')

  if (devNode && commandsNode) {
    state.move(devNode.id, commandsNode.id)
  }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="toggleScripts"
      >
        切换 scripts 展开
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="updateDev"
      >
        更新 dev
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="insertPreview"
      >
        插入 preview
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        @click="moveDev"
      >
        移动 dev 到 commands
      </button>
    </div>

    <div class="grid gap-4 min-[960px]:grid-cols-2">
      <section class="overflow-hidden rounded-xl border border-slate-200 p-4">
        <h3 class="mb-3 text-base font-semibold text-slate-900">
          Tree Rows
        </h3>
        <JsonTreeView :items="items" :selected-id="selectedId" @select="api.inputNodeClick" />
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200 p-4">
        <h3 class="mb-3 text-base font-semibold text-slate-900">
          Stringify
        </h3>
        <pre class="m-0 overflow-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-200">{{
          output
        }}</pre>
      </section>
    </div>
  </div>
</template>
