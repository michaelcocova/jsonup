import { defineConfig } from 'tsdown'

export default defineConfig({
  platform: 'neutral',
  exports: true,
  dts: { vue: true },
  deps: {
    neverBundle: ['@jsonup/operation', '@jsonup/themes', '@jsonup/core'],
  },
})
