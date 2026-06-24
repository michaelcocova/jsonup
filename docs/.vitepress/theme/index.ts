import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import '@shikijs/vitepress-twoslash/style.css'
import './style.css'
import '@fontsource-variable/fira-code/wght.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router }) {
    app.use(TwoslashFloatingVue)
    // 监听路由改变，完成后将页面滚动到顶部
    router.onAfterRouteChanged = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // 平滑滚动，如果不需要平滑效果可改为 'auto'
      })
    }
  },
} satisfies Theme
