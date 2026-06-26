<script setup lang="ts">
import { GithubLight } from '@jsonup/themes'
import { JsonupViewer } from '@jsonup/vue'
import '@jsonup/vue/style.css'

const data = {
  name: '@jsonup/monorepo',
  type: 'module',
  version: '0.0.1',
  private: true,
  config: {
    commitizen: {
      path: 'node_modules/cz-git',
    },
  },
  packageManager: 'pnpm@11.6.0',
  description: 'A high-performance, highly customizable, and framework-agnostic JSON viewer and editor ecosystem.',
  author: {
    name: 'Michael Cocova',
    email: 'michael.cocova@gmail.com',
  },
  license: 'MIT',
  homepage: 'https://github.com/michaelcocova/jsonup#readme',
  repository: {
    type: 'git',
    url: 'git+https://github.com/michaelcocova/jsonup.git',
  },
  bugs: {
    url: 'https://github.com/michaelcocova/jsonup/issues',
  },
  engines: {
    node: '>=22.12.0',
  },
  scripts: {
    'prepare': 'simple-git-hooks',
    'commit': 'cz',
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
    'typecheck': 'tsc --noEmit && vue-tsc --noEmit',
    'ready': 'turbo run lint test build && pnpm run typecheck',
    'dev': 'turbo run docs:dev',
    'build': 'turbo run docs:build',
    'build:packages': 'turbo run build --filter="./packages/*"',
    'changeset': 'changeset',
    'version-packages': 'changeset version && node scripts/aggregate-changeset.js',
  },
  dependencies: {
    tsdown: '0.22.3',
  },
  devDependencies: {
    '@antfu/eslint-config': '^9.0.0',
    '@changesets/changelog-github': '^0.7.0',
    '@changesets/cli': '^2.31.0',
    '@commitlint/cli': '^21.0.2',
    '@commitlint/config-conventional': '^21.0.2',
    '@jsonup/core': 'workspace:*',
    '@jsonup/operation': 'workspace:*',
    '@jsonup/themes': 'workspace:*',
    '@jsonup/vue': 'workspace:*',
    '@types/node': '^26.0.0',
    'commitizen': '^4.3.2',
    'cz-git': '^1.13.1',
    'decimal.js': '10.6.0',
    'eslint': '^10.5.0',
    'eslint-plugin-format': '^2.0.1',
    'less': '^4.6.6',
    'lint-staged': '^17.0.7',
    'prettier': '^3.8.4',
    'simple-git-hooks': '^2.13.1',
    'turbo': '^2.9.18',
    'typescript': '^6.0.3',
    'vitest': '^4.1.9',
  },
}
</script>

<template>
  <JsonupViewer :data="data" line-numbers :theme="GithubLight" />
</template>
