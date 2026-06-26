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
  date: new Date(),
}
</script>

<template>
  <JsonupViewer
    :data="data"
    show-line-numbers
    :theme="GithubLight"
  />
</template>
