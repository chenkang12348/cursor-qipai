import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'

/** GitHub Pages 等子路径部署需 SPA 404 回退 */
function spaFallback404() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const index = join('dist', 'index.html')
      copyFileSync(index, join('dist', '404.html'))
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    spaFallback404(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
