import { copyFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type ResolvedConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'

const outDir = process.env.VITE_OUT_DIR || 'dist'
const base = process.env.VITE_BASE_PATH || '/'

/** GitHub Pages 子路径 SPA 需要 404 回退与 .nojekyll */
function githubPagesArtifacts() {
  let resolvedOutDir = 'dist'
  return {
    name: 'github-pages-artifacts',
    configResolved(config: ResolvedConfig) {
      resolvedOutDir = config.build.outDir
    },
    closeBundle() {
      const index = join(resolvedOutDir, 'index.html')
      copyFileSync(index, join(resolvedOutDir, '404.html'))
      writeFileSync(join(resolvedOutDir, '.nojekyll'), '')
    },
  }
}

export default defineConfig({
  base,
  build: { outDir },
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    githubPagesArtifacts(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
