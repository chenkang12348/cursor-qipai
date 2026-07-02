<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tile } from '@/games/mahjong/types/ruleConfig'
import { tileLabel } from '@/games/mahjong/engine/engine'
import { getTileImageUrl } from '@/games/mahjong/assets/tileAssets'
import MahjongTileSvg from './MahjongTileSvg.vue'

const props = defineProps<{
  tile: Tile
  selected?: boolean
  small?: boolean
  hand?: boolean
  dimmed?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

const svgFallback = ref(false)
const src = computed(() => getTileImageUrl(props.tile))

function onImgError() {
  svgFallback.value = true
}
</script>

<template>
  <button
    type="button"
    class="card-tile"
    :class="{
      'card-tile--selected': selected,
      'card-tile--small': small,
      'card-tile--hand': hand,
      'card-tile--dimmed': dimmed,
    }"
    :aria-label="tileLabel(tile)"
    @click="emit('click')"
  >
    <span class="card-tile__plate" aria-hidden="true">
      <img
        v-if="!svgFallback"
        class="card-tile__img"
        :src="src"
        :alt="tileLabel(tile)"
        :loading="hand ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
        @error="onImgError"
      />
      <MahjongTileSvg v-else :tile="tile" :compact="small" />
    </span>
  </button>
</template>

<style scoped>
.card-tile {
  position: relative;
  min-width: 36px;
  height: 52px;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  flex-shrink: 0;
  user-select: none;
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
  -webkit-tap-highlight-color: transparent;
  overflow: visible;
}

.card-tile__plate {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px 5px 5px 4px;
  background: linear-gradient(165deg, #fffef9 0%, #f5ecd6 52%, #e8dcc0 100%);
  border: 1px solid #b8956a;
  border-left: 3px solid #2e7d52;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    0 2px 5px rgba(0, 0, 0, 0.32),
    0 0 0 0.5px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-tile__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  pointer-events: none;
  background: #fffef9;
}

.card-tile--small {
  min-width: 24px;
  height: 34px;
}

.card-tile--small .card-tile__plate {
  border-left-width: 2px;
  border-radius: 3px 4px 4px 3px;
}

.card-tile--hand {
  min-width: 40px;
  height: 58px;
}

.card-tile--hand.card-tile--selected {
  transform: translateY(-10px) scale(1.05);
  z-index: 4;
}

.card-tile--hand.card-tile--selected .card-tile__plate {
  border-color: #d4a017;
  box-shadow:
    0 0 0 2px rgba(212, 160, 23, 0.85),
    0 6px 14px rgba(212, 160, 23, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
}

.card-tile--dimmed {
  opacity: 0.55;
  filter: saturate(0.75);
}

.card-tile--hand:active:not(.card-tile--dimmed):not(.card-tile--selected) {
  transform: translateY(-4px);
}

.card-tile--selected:not(.card-tile--hand) {
  transform: translateY(-5px);
}

.card-tile--selected:not(.card-tile--hand) .card-tile__plate {
  border-color: #d4a017;
  box-shadow:
    0 0 0 1px rgba(212, 160, 23, 0.7),
    0 4px 8px rgba(0, 0, 0, 0.28);
}
</style>
