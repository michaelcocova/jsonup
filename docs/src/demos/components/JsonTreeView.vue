<script setup lang="ts">
import { VList } from 'virtua/vue'

interface TreeViewItem {
  id: string
  level: number
  title: string
  type: string
  path: string
  value: string
  hasChildren: () => boolean
  isExpanded: () => boolean
  toggleExpand: () => void
}

const props = withDefaults(
  defineProps<{
    items: TreeViewItem[]
    selectedId?: string | null
    maxHeight?: string
  }>(),
  {
    selectedId: null,
    maxHeight: '320px',
  },
)

const emit = defineEmits<{
  select: [id: string]
}>()

function cn(...values: Array<string | Record<string, boolean>>) {
  return values
    .flatMap((value) => {
      if (typeof value === 'string') {
        return value
      }

      return Object.entries(value)
        .filter(([, enabled]) => enabled)
        .map(([className]) => className)
    })
    .join(' ')
}

function handleToggle(item: TreeViewItem) {
  item.toggleExpand()
}
</script>

<template>
  <div class="w-full">
    <VList
      v-slot="{ item }"
      :data="props.items"
      :style="{ height: props.maxHeight }"
      class="w-full overflow-auto rounded-[10px] border border-slate-200 bg-white p-1 [--tree-row-height:32px] [--tree-spacing:14px]"
    >
      <div
        :key="item.id"
        :style="{ marginLeft: `calc(var(--tree-spacing) * ${item.level})` }"
        :data-id="item.id"
        :class="
          cn(
            'relative flex h-(--tree-row-height) min-h-(--tree-row-height) cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-100',
            {
              'bg-sky-100': props.selectedId === item.id,
              'bg-transparent': props.selectedId !== item.id,
            },
          )
        "
        @click="emit('select', item.id)"
      >
        <button
          :class="
            cn(
              'ml-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border-0 bg-transparent p-0 transition-colors hover:bg-zinc-200',
              {
                'pointer-events-none opacity-0': !item.hasChildren(),
              },
            )
          "
          @click.stop="handleToggle(item)"
        >
          <span
            :class="
              cn('text-[10px] leading-none transition-transform', {
                'rotate-90': item.isExpanded(),
              })
            "
          >
            ▶
          </span>
        </button>

        <label class="min-w-[72px] font-medium text-slate-900">{{ item.title }}</label>
        <span class="flex-none rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
          {{ item.type }}
        </span>
        <span class="min-w-[120px] whitespace-nowrap text-xs text-zinc-500">{{ item.path }}</span>
        <span class="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-500">
          {{ item.value }}
        </span>
      </div>
    </VList>
  </div>
</template>
