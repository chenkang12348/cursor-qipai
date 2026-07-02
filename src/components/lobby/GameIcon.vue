<script setup lang="ts">
defineProps<{
  gameId: string
  size?: number
}>()
</script>

<template>
  <span class="game-icon" :style="{ '--icon-size': (size ?? 52) + 'px' }">
    <!-- 麻将 -->
    <svg v-if="gameId === 'mahjong'" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="48" height="44" rx="6" fill="#1e8b4c" />
      <rect x="10" y="12" width="44" height="40" rx="5" fill="#f5f0e0" stroke="#c4a86a" stroke-width="1.5" />
      <text x="32" y="42" text-anchor="middle" font-size="22" font-weight="800" fill="#c41e3a">中</text>
    </svg>

    <!-- 斗地主 -->
    <svg v-else-if="gameId === 'doudizhu'" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="8" width="34" height="48" rx="5" fill="#fff" stroke="#ddd" stroke-width="1.5" transform="rotate(-8 31 32)" />
      <rect x="18" y="6" width="34" height="48" rx="5" fill="#fff" stroke="#ddd" stroke-width="1.5" />
      <text x="35" y="28" text-anchor="middle" font-size="14" font-weight="800" fill="#e74c3c">J</text>
      <text x="35" y="44" text-anchor="middle" font-size="18" fill="#e74c3c">♥</text>
      <rect x="28" y="14" width="34" height="48" rx="5" fill="#fff9e6" stroke="#f0c040" stroke-width="1.5" transform="rotate(10 45 38)" />
      <text x="48" y="38" text-anchor="middle" font-size="11" font-weight="700" fill="#8e44ad">王</text>
    </svg>

    <!-- 五子棋 -->
    <svg v-else-if="gameId === 'gomoku'" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="6" width="52" height="52" rx="4" fill="#dcb35c" stroke="#8b6914" stroke-width="1.5" />
      <line x1="6" y1="22" x2="58" y2="22" stroke="#6b4f1d" stroke-width="0.8" opacity="0.5" />
      <line x1="6" y1="38" x2="58" y2="38" stroke="#6b4f1d" stroke-width="0.8" opacity="0.5" />
      <line x1="22" y1="6" x2="22" y2="58" stroke="#6b4f1d" stroke-width="0.8" opacity="0.5" />
      <line x1="38" y1="6" x2="38" y2="58" stroke="#6b4f1d" stroke-width="0.8" opacity="0.5" />
      <circle cx="30" cy="30" r="9" fill="url(#blackStone)" />
      <circle cx="42" cy="38" r="9" fill="url(#whiteStone)" stroke="#bbb" stroke-width="0.8" />
      <defs>
        <radialGradient id="blackStone" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#555" />
          <stop offset="100%" stop-color="#111" />
        </radialGradient>
        <radialGradient id="whiteStone" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#fff" />
          <stop offset="100%" stop-color="#ccc" />
        </radialGradient>
      </defs>
    </svg>
  </span>
</template>

<style scoped>
.game-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  transition: transform 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.game-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
}
</style>
