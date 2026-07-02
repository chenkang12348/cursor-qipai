<script setup lang="ts">
defineProps<{
  name: string
  cardCount?: number
  isLandlord?: boolean
  isActive?: boolean
  isBot?: boolean
  position?: 'top' | 'left' | 'right' | 'bottom'
}>()
</script>

<template>
  <div
    class="player-badge"
    :class="[
      `player-badge--${position ?? 'top'}`,
      { 'player-badge--active': isActive, 'player-badge--bot': isBot },
    ]"
  >
    <div class="player-badge__avatar">
      <span>{{ isBot ? '🤖' : '👤' }}</span>
    </div>
    <div class="player-badge__info">
      <span class="player-badge__name">{{ name }}</span>
      <van-tag v-if="isLandlord" type="warning" size="medium">地主</van-tag>
      <van-tag v-if="isBot" plain size="medium">AI</van-tag>
    </div>
    <div v-if="cardCount !== undefined" class="player-badge__cards">
      <span v-for="n in Math.min(cardCount, 5)" :key="n" class="card-back" />
      <span v-if="cardCount > 0" class="player-badge__count">{{ cardCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.player-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  color: #fff;
  min-width: 72px;
  transition: outline 0.2s;
}

.player-badge--active {
  outline: 2px solid var(--color-accent);
  box-shadow: 0 0 12px rgba(212, 160, 23, 0.5);
}

.player-badge__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.player-badge__info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.player-badge__name {
  font-size: 12px;
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-badge__cards {
  display: flex;
  align-items: center;
  gap: 2px;
}

.card-back {
  width: 14px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(135deg, #2980b9, #1a5276);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-left: -6px;
}

.card-back:first-child {
  margin-left: 0;
}

.player-badge__count {
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.9;
}

.player-badge--bottom {
  flex-direction: row;
  align-self: center;
  gap: 8px;
}

.player-badge--bottom .player-badge__cards {
  display: none;
}
</style>
