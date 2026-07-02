<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="game-info-panel">
    <h4 v-if="title" class="game-info-panel__title">{{ title }}</h4>
    <slot />
  </div>
</template>

<style scoped>
.game-info-panel {
  font-size: 13px;
}

.game-info-panel__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.game-info-panel :deep(p) {
  margin: 6px 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.game-info-panel :deep(.van-cell) {
  padding: 8px 0;
}
</style>
