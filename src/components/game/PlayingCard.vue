<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  red?: boolean
  joker?: boolean
  selected?: boolean
  small?: boolean
  hand?: boolean
  dimmed?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

const suitChar = computed(() => {
  const m = props.label.match(/[♠♥♣♦]/)
  return m?.[0] ?? ''
})

const rankText = computed(() => props.label.replace(/[♠♥♣♦]/g, '').trim())

const jokerLabel = computed(() => {
  if (!props.joker) return ''
  return rankText.value.includes('大') ? '大王' : '小王'
})
</script>

<template>
  <button
    type="button"
    class="playing-card"
    :class="{
      'playing-card--red': red,
      'playing-card--black': !red && !joker,
      'playing-card--joker': joker,
      'playing-card--joker-big': joker && jokerLabel === '大王',
      'playing-card--selected': selected,
      'playing-card--small': small,
      'playing-card--hand': hand,
      'playing-card--dimmed': dimmed,
    }"
    @click="emit('click')"
  >
    <span class="playing-card__pattern" aria-hidden="true" />

    <template v-if="joker">
      <span class="playing-card__joker-mark">{{ jokerLabel }}</span>
      <span class="playing-card__joker-icon">🃏</span>
    </template>

    <template v-else>
      <span class="playing-card__corner playing-card__corner--tl">
        <span class="playing-card__rank">{{ rankText }}</span>
        <span class="playing-card__suit">{{ suitChar }}</span>
      </span>
      <span class="playing-card__center">{{ suitChar }}</span>
      <span class="playing-card__corner playing-card__corner--br">
        <span class="playing-card__rank">{{ rankText }}</span>
        <span class="playing-card__suit">{{ suitChar }}</span>
      </span>
    </template>
  </button>
</template>

<style scoped>
.playing-card {
  position: relative;
  min-width: 46px;
  height: 64px;
  padding: 0;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #eef2f7 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 1) inset,
    0 2px 6px rgba(15, 23, 42, 0.18),
    0 0 0 0.5px rgba(15, 23, 42, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  font-family: Georgia, 'Times New Roman', var(--font-base);
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.playing-card__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: repeating-linear-gradient(
    45deg,
    #64748b 0,
    #64748b 1px,
    transparent 1px,
    transparent 6px
  );
  pointer-events: none;
}

.playing-card__corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}

.playing-card__corner--tl {
  top: 3px;
  left: 4px;
}

.playing-card__corner--br {
  bottom: 3px;
  right: 4px;
  transform: rotate(180deg);
}

.playing-card__rank {
  font-size: 11px;
  font-weight: 800;
}

.playing-card__suit {
  font-size: 10px;
  font-weight: 700;
}

.playing-card__center {
  font-size: 22px;
  line-height: 1;
  opacity: 0.92;
  z-index: 1;
}

.playing-card--red {
  color: #dc2626;
}

.playing-card--black {
  color: #1e293b;
}

.playing-card--joker {
  border-color: #eab308;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
    linear-gradient(145deg, #fef9c3 0%, #fde047 40%, #f59e0b 100%);
  color: #7c2d12;
}

.playing-card--joker-big {
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.45) 0%, transparent 50%),
    linear-gradient(145deg, #fecaca 0%, #f87171 45%, #dc2626 100%);
  color: #fff;
  border-color: #fca5a5;
}

.playing-card__joker-mark {
  position: absolute;
  top: 4px;
  left: 5px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.1;
  z-index: 1;
}

.playing-card__joker-icon {
  font-size: 20px;
  line-height: 1;
  z-index: 1;
}

.playing-card--small {
  min-width: 32px;
  height: 44px;
  border-radius: 4px;
}

.playing-card--small .playing-card__rank {
  font-size: 9px;
}

.playing-card--small .playing-card__suit {
  font-size: 8px;
}

.playing-card--small .playing-card__center {
  font-size: 14px;
}

.playing-card--hand {
  min-width: 44px;
  height: 62px;
  border-radius: 7px;
}

.playing-card--hand .playing-card__rank {
  font-size: 12px;
}

.playing-card--hand .playing-card__suit {
  font-size: 11px;
}

.playing-card--hand .playing-card__center {
  font-size: 24px;
}

.playing-card--hand .playing-card__joker-mark {
  font-size: 10px;
}

.playing-card--hand .playing-card__joker-icon {
  font-size: 24px;
}

.playing-card--hand.playing-card--selected {
  transform: translateY(-10px) scale(1.04);
  z-index: 3;
  border-color: #d4a017;
  box-shadow:
    0 0 0 2px rgba(212, 160, 23, 0.9),
    0 8px 18px rgba(212, 160, 23, 0.35),
    0 1px 0 rgba(255, 255, 255, 1) inset;
}

.playing-card--dimmed {
  opacity: 0.65;
  filter: saturate(0.8);
}

.playing-card--selected:not(.playing-card--hand) {
  transform: translateY(-8px);
  border-color: #d4a017;
  z-index: 2;
}

.playing-card:active:not(.playing-card--selected) {
  transform: translateY(-3px);
}
</style>
