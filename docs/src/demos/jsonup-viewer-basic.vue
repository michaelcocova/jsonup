<script setup lang="ts">
import { GithubLight } from '@jsonup/themes'
import { JsonupViewer } from '@jsonup/vue'
import '@jsonup/vue/style.css'

const data = {
  name: 'jsonup',
  version: '0.1.0',
  scripts: {
    dev: 'vp dev',
    build: 'vp build',
  },
  features: ['parse', 'stringify', 'viewer'],
  repository: {
    type: 'git',
    url: 'https://github.com/cocoa/jsonup',
  },
}
</script>

<template>
  <div
    class="overflow-auto rounded-xl border border-slate-200 bg-white p-3 [&_.jsonup-viewer]:grid [&_.jsonup-viewer]:gap-0.5 [&_.jsonup-viewer]:font-mono [&_.jsonup-viewer]:text-[13px] [&_.jsonup-viewer]:leading-6 [&_.jsonup-viewer_.content]:whitespace-pre-wrap [&_.jsonup-viewer_.content]:wrap-break-word [&_.jsonup-viewer_.line[data-interactive='true']]:cursor-pointer [&_.jsonup-viewer_.line-number]:select-none [&_.jsonup-viewer_.line-number]:text-right [&_.jsonup-viewer_.line-number]:text-zinc-400 [&_.jsonup-viewer.line-numbers_.line]:grid [&_.jsonup-viewer.line-numbers_.line]:grid-cols-[48px_minmax(0,1fr)] [&_.jsonup-viewer.line-numbers_.line]:items-start [&_.jsonup-viewer.line-numbers_.line]:gap-3"
  >
    <JsonupViewer
      :data="data"
      show-line-numbers
      :theme="GithubLight"
    />
  </div>
</template>
