<script setup lang="ts">
import { ref } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useLandscapeGame } from '@/composables/useLandscapeGame'

const props = defineProps<{
  title: string
  gameId?: string
  landscape?: boolean
}>()

defineSlots<{ default?: () => unknown; sidebar?: () => unknown }>()

const emit = defineEmits<{ back: []; setup: []; lobby: [] }>()
const { isDesktop } = useBreakpoint()
const showMenu = ref(false)

useLandscapeGame(() => !!props.landscape)

const menuActions = [
  { name: 'setup', text: '重新配置' },
  { name: 'lobby', text: '返回大厅' },
]

function onBack() {
  emit('back')
}

function onMenu() {
  showMenu.value = true
}

function onMenuSelect(action: { name: string }) {
  showMenu.value = false
  if (action.name === 'setup') emit('setup')
  else if (action.name === 'lobby') emit('lobby')
}
</script>

<template>
  <div
    class="game-layout page-content--game"
    :class="{
      'game-layout--desktop': isDesktop,
      'game-layout--landscape-mobile': landscape && !isDesktop,
    }"
  >
    <van-nav-bar
      :title="title"
      left-arrow
      fixed
      class="game-nav"
      @click-left="onBack"
    >
      <template v-if="gameId" #right>
        <van-icon name="ellipsis" size="20" @click="onMenu" />
      </template>
    </van-nav-bar>
    <div class="game-layout__body">
      <main class="game-layout__main">
        <slot />
      </main>
      <aside v-if="isDesktop && $slots.sidebar" class="game-layout__sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      @select="onMenuSelect"
    />
  </div>
</template>

<style scoped>
.game-nav {
  background: rgba(0, 0, 0, 0.35) !important;
  z-index: 10;
}
.game-nav :deep(.van-nav-bar__title),
.game-nav :deep(.van-icon) {
  color: #fff;
}
.game-layout__body {
  display: flex;
  height: 100dvh;
  padding-top: 46px;
}
.game-layout__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.game-layout--desktop .game-layout__main {
  flex: 3;
}
.game-layout__sidebar {
  flex: 1;
  max-width: 320px;
  background: var(--color-card);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
  overflow-y: auto;
}
</style>
