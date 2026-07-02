<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const active = computed(() => {
  if (route.path.startsWith('/settings')) return 1
  return 0
})

const showTabbar = computed(
  () =>
    !route.path.includes('/play') &&
    !route.path.includes('/rules') &&
    !route.path.startsWith('/setup'),
)

function onChange(index: number) {
  router.push(index === 0 ? '/' : '/settings')
}
</script>

<template>
  <div class="app-layout">
    <router-view />
    <van-tabbar v-if="showTabbar" :model-value="active" @change="onChange" safe-area-inset-bottom>
      <van-tabbar-item icon="wap-home-o">大厅</van-tabbar-item>
      <van-tabbar-item icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100dvh;
  background: var(--color-bg);
}
</style>
