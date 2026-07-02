<script setup lang="ts">
import { computed } from 'vue'
import { TILE_BACK_URL } from '@/games/mahjong/assets/tileAssets'

const props = defineProps<{
  horizontal?: boolean
  count?: number
}>()

const displayCount = computed(() => Math.max(0, props.count ?? 0))

const groupStyle = computed(() =>
  props.horizontal && displayCount.value
    ? ({ '--back-total': String(displayCount.value) } as Record<string, string>)
    : undefined,
)
</script>

<template>
  <div
    v-if="displayCount > 0"
    class="tile-back-group"
    :class="{ 'tile-back-group--horizontal': horizontal }"
    :style="groupStyle"
    :title="`${displayCount} 张`"
  >
    <img
      v-for="n in displayCount"
      :key="n"
      class="tile-back"
      :src="TILE_BACK_URL"
      alt=""
      draggable="false"
    />
    <span class="tile-back-group__count">{{ displayCount }}</span>
  </div>
</template>

<style scoped>
.tile-back-group {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  margin-top: 4px;
  max-height: 92px;
  overflow: hidden;
}

.tile-back {
  display: block;
  width: 15px;
  height: auto;
  aspect-ratio: 36 / 52;
  margin-top: -13px;
  flex-shrink: 0;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.tile-back:first-child {
  margin-top: 0;
}

.tile-back-group--horizontal {
  flex-direction: row;
  flex-wrap: nowrap;
  max-height: none;
  max-width: min(100%, 240px);
  justify-content: center;
  align-items: flex-end;
}

.tile-back-group--horizontal .tile-back {
  width: clamp(8px, calc(240px / var(--back-total, 14)), 16px);
  margin-top: 0;
  margin-left: clamp(-7px, calc(-240px / var(--back-total, 14) * 0.45), -4px);
}

.tile-back-group--horizontal .tile-back:first-child {
  margin-left: 0;
}

.tile-back-group__count {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
  min-width: 16px;
  text-align: center;
}

.tile-back-group--horizontal .tile-back-group__count {
  margin-top: 0;
  margin-left: 4px;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  flex-shrink: 0;
}
</style>
