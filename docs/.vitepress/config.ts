import type { DefaultTheme } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'

interface MarkdownConfig {
  use: (plugin: unknown) => void
}

const nav: DefaultTheme.NavItem[] = [
  { text: '指南', link: '/introduction/what-is-jsonup' },
  { text: '示例', link: '/examples' },
  { text: '主题', link: '/themes' },
]

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '简介',
    items: [
      { text: '什么是 jsonup？', link: '/introduction/what-is-jsonup' },
      { text: '快速开始', link: '/introduction/getting-started' },
    ],
  },
  {
    text: '示例',
    items: [
      { text: '示例总览', link: '/examples' },
      { text: 'Core 示例', link: '/examples/core' },
      { text: 'Vue 示例', link: '/examples/vue' },
      { text: '操作示例', link: '/examples/editing' },
      { text: '10w+ 数据', link: '/examples/10w' },
    ],
  },
  {
    text: '主题与性能',
    items: [
      { text: '主题预览', link: '/themes' },
      { text: '虚拟滚动', link: '/virtual' },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/jsonup/',
  srcDir: 'src',
  title: 'jsonup',
  description: 'JSON document model, operations and Vue bindings.',
  vite: {
    server: {
      port: 3100,
    },
    plugins: [...tailwindcss()],
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        twoslashOptions: {
          compilerOptions: {
            paths: {
              '@jsonup/*': ['../packages/*/src'],
            },
          },
        },
      }),
    ],
    config(md: MarkdownConfig) {
      md.use(vitepressDemoPlugin)
    },
  },
  themeConfig: {
    nav,
    sidebar,
  },
})
