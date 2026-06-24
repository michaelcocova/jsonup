/**
 * 仅处理已暂存文件，避免在提交前扫描整个仓库。
 * 当前主要做格式化和代码检查，保证提交内容的基本一致性。
 */
const config = {
  '*.{ts,js,vue,tsx,jsx,mjs,cjs}': ['eslint --fix'],
  '*.{json,md,yml,yaml,css,less}': ['prettier --write'],
}

export default config
