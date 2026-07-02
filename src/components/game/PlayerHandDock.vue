<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  hint?: string
  count?: number
  active?: boolean
  waiting?: boolean
  /** 手牌区主题：麻将 / 斗地主 */
  theme?: 'mahjong' | 'doudizhu'
}>()
</script>

<template>
  <section
    class="player-hand-dock"
    :class="{
      'player-hand-dock--active': active,
      'player-hand-dock--waiting': waiting && !active,
      'player-hand-dock--mahjong': theme === 'mahjong',
      'player-hand-dock--doudizhu': theme === 'doudizhu',
    }"
  >
    <div class="player-hand-dock__inner">
      <div class="player-hand-dock__header">
        <div class="player-hand-dock__title-row">
          <span class="player-hand-dock__title">{{ title ?? '我的手牌' }}</span>
          <span v-if="count !== undefined" class="player-hand-dock__count">{{ count }} 张</span>
        </div>
        <span v-if="subtitle" class="player-hand-dock__subtitle">{{ subtitle }}</span>
        <span v-else-if="active" class="player-hand-dock__badge">轮到你</span>
        <span v-else-if="waiting" class="player-hand-dock__badge player-hand-dock__badge--wait">
          等待中
        </span>
      </div>

      <p class="player-hand-dock__hint">{{ hint ?? '' }}</p>

      <div class="player-hand-dock__cards">
        <slot />
      </div>

      <div v-if="$slots.actions" class="player-hand-dock__actions">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.player-hand-dock {
  position: relative;
  z-index: 30;
  flex-shrink: 0;
  isolation: isolate;
  overflow: visible;
  padding: 0 8px calc(6px + var(--safe-bottom));
}

.player-hand-dock__inner {
  background: var(--color-hand-bar);
  border-radius: 14px 14px 10px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 -4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: visible;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.player-hand-dock--active .player-hand-dock__inner {
  border-color: rgba(255, 176, 32, 0.55);
  box-shadow:
    0 -4px 28px rgba(255, 176, 32, 0.25),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.player-hand-dock--waiting {
  opacity: 0.94;
}

.player-hand-dock__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 0;
  flex-wrap: wrap;
}

.player-hand-dock__title-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.player-hand-dock__title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.player-hand-dock__count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}

.player-hand-dock__subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
}

.player-hand-dock__badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: linear-gradient(180deg, #ffd54f, #ff9800);
  color: #3d2800;
}

.player-hand-dock__badge--wait {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
}

.player-hand-dock__hint {
  margin: 0;
  padding: 4px 12px 0;
  min-height: 20px;
  font-size: 11px;
  line-height: 1.4;
  color: #ffe082;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-hand-dock__cards {
  overflow: visible;
  padding: 8px 10px 4px;
  min-height: 64px;
  width: 100%;
  box-sizing: border-box;
}

.player-hand-dock__cards :deep(.hand-row) {
  background: transparent;
  overflow: visible;
  padding: 0;
  min-height: 58px;
  width: 100%;
}

.player-hand-dock__cards :deep(.hand-row--fit) {
  min-height: 58px;
}

.player-hand-dock__inner {
  width: 100%;
  box-sizing: border-box;
}

.player-hand-dock__actions {
  padding: 4px 10px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
