<script setup lang="ts">
import { computed } from 'vue'
import type { Tile } from '@/games/mahjong/types/ruleConfig'
import {
  honorChar,
  isSuitNumber,
  pinDots,
  souStickCount,
  tileAriaLabel,
  wanNumeral,
} from './tilePatterns'

const props = defineProps<{
  tile: Tile
  compact?: boolean
}>()

const label = computed(() => tileAriaLabel(props.tile))

const isWan = computed(() => props.tile.suit === 'wan')
const isTiao = computed(() => props.tile.suit === 'tiao')
const isTong = computed(() => props.tile.suit === 'tong')
const isHonor = computed(() => !isSuitNumber(props.tile.suit))

const honorType = computed(() => props.tile.suit)

const dots = computed(() => (isTong.value ? pinDots(props.tile.rank) : []))
const sticks = computed(() => (isTiao.value ? souStickCount(props.tile.rank) : 0))

/** 3×3 / 2×4 网格 → SVG 坐标 */
function dotXY(col: number, row: number, cols: number, rows: number): { cx: number; cy: number } {
  const faceX = 8
  const faceW = 26
  const faceY = 6
  const faceH = 40
  const stepX = faceW / (cols - 1 || 1)
  const stepY = faceH / (rows - 1 || 1)
  return {
    cx: faceX + col * stepX,
    cy: faceY + row * stepY,
  }
}

const pinPositions = computed(() => {
  const rows = props.tile.rank === 8 ? 4 : 3
  const cols = 3
  return dots.value.map(([c, r]) => {
    const { cx, cy } = dotXY(c, r, cols, rows)
    const big = props.tile.rank === 1
    return { cx, cy, r: big ? 4.2 : 2.6 }
  })
})

const souSticks = computed(() => {
  const n = sticks.value
  if (n <= 0) return []
  if (n === 1) return [{ x: 16, w: 8, special: true as const }]
  const stickW = Math.min(2.2, 18 / n)
  const gap = 0.6
  const totalW = n * stickW + (n - 1) * gap
  const startX = 20 - totalW / 2
  return Array.from({ length: n }, (_, i) => ({
    x: startX + i * (stickW + gap),
    w: stickW,
    special: false as const,
  }))
})
</script>

<template>
  <svg
    class="mj-tile-svg"
    :class="{ 'mj-tile-svg--compact': compact }"
    viewBox="0 0 36 52"
    role="img"
    :aria-label="label"
  >
    <defs>
      <linearGradient id="mj-spine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4caf7a" />
        <stop offset="55%" stop-color="#2e7d52" />
        <stop offset="100%" stop-color="#1b4332" />
      </linearGradient>
      <linearGradient id="mj-face" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#fffef8" />
        <stop offset="100%" stop-color="#f0e8d0" />
      </linearGradient>
      <linearGradient id="mj-pin-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ef5350" />
        <stop offset="100%" stop-color="#c62828" />
      </linearGradient>
      <linearGradient id="mj-pin-blue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#42a5f5" />
        <stop offset="100%" stop-color="#1565c0" />
      </linearGradient>
      <linearGradient id="mj-stick" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2e7d32" />
        <stop offset="100%" stop-color="#1b5e20" />
      </linearGradient>
    </defs>

    <!-- 牌体阴影 -->
    <rect x="1" y="2" width="34" height="49" rx="3" fill="rgba(0,0,0,0.12)" />

    <!-- 牌脊（Riichi 风格绿色侧边） -->
    <path
      d="M2 2 L7 2 L7 50 L2 50 Z"
      fill="url(#mj-spine)"
    />
    <path
      d="M2 2 L7 2 L7 50 L2 50 Z"
      fill="none"
      stroke="#14532d"
      stroke-width="0.4"
    />

    <!-- 牌面 -->
    <rect
      x="6.5"
      y="2"
      width="28"
      height="48"
      rx="2.5"
      fill="url(#mj-face)"
      stroke="#c4a574"
      stroke-width="0.6"
    />
    <rect
      x="7.5"
      y="3"
      width="26"
      height="46"
      rx="2"
      fill="none"
      stroke="rgba(255,255,255,0.65)"
      stroke-width="0.4"
    />

    <!-- 万子 -->
    <template v-if="isWan">
      <text
        x="20"
        y="22"
        text-anchor="middle"
        class="mj-tile-svg__wan-num"
        fill="#b71c1c"
      >
        {{ wanNumeral(tile.rank) }}
      </text>
      <text
        x="20"
        y="38"
        text-anchor="middle"
        class="mj-tile-svg__wan-suit"
        fill="#c62828"
      >
        万
      </text>
    </template>

    <!-- 条子 -->
    <template v-else-if="isTiao">
      <template v-for="(stick, i) in souSticks" :key="i">
        <rect
          v-if="stick.special"
          x="16"
          y="10"
          width="8"
          height="28"
          rx="1.5"
          fill="url(#mj-stick)"
        />
        <rect
          v-if="stick.special"
          x="17"
          y="10"
          width="6"
          height="6"
          rx="1"
          fill="#c62828"
        />
        <rect
          v-else
          :x="stick.x"
          y="12"
          :width="stick.w"
          height="26"
          rx="0.8"
          fill="url(#mj-stick)"
        />
      </template>
    </template>

    <!-- 筒子 -->
    <template v-else-if="isTong">
      <circle
        v-for="(d, i) in pinPositions"
        :key="i"
        :cx="d.cx"
        :cy="d.cy"
        :r="d.r"
        :fill="i % 2 === 0 ? 'url(#mj-pin-blue)' : 'url(#mj-pin-red)'"
        stroke="#fff"
        stroke-width="0.35"
      />
      <circle
        v-if="tile.rank === 1"
        :cx="pinPositions[0]?.cx"
        :cy="pinPositions[0]?.cy"
        r="1.2"
        fill="#fff"
        opacity="0.5"
      />
    </template>

    <!-- 字牌 -->
    <template v-else-if="isHonor">
      <rect
        v-if="honorType === 'bai'"
        x="14"
        y="18"
        width="12"
        height="16"
        rx="1.2"
        fill="#fafafa"
        stroke="#1565c0"
        stroke-width="1.6"
      />
      <text
        v-else
        x="20"
        y="32"
        text-anchor="middle"
        class="mj-tile-svg__honor"
        :fill="
          honorType === 'zhong'
            ? '#c62828'
            : honorType === 'fa'
              ? '#2e7d32'
              : '#37474f'
        "
      >
        {{ honorChar(honorType) }}
      </text>
    </template>
  </svg>
</template>

<style scoped>
.mj-tile-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.mj-tile-svg__wan-num {
  font-size: 14px;
  font-weight: 800;
  font-family: 'STKaiti', 'KaiTi', 'SimKai', serif;
}

.mj-tile-svg__wan-suit {
  font-size: 13px;
  font-weight: 800;
  font-family: 'STKaiti', 'KaiTi', 'SimKai', serif;
}

.mj-tile-svg__honor {
  font-size: 16px;
  font-weight: 900;
  font-family: 'STKaiti', 'KaiTi', 'SimKai', serif;
}

.mj-tile-svg--compact .mj-tile-svg__wan-num {
  font-size: 10px;
}

.mj-tile-svg--compact .mj-tile-svg__wan-suit {
  font-size: 9px;
}

.mj-tile-svg--compact .mj-tile-svg__honor {
  font-size: 11px;
}
</style>
