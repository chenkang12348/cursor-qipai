<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message?: string
  gameName?: string
}>()

const emit = defineEmits<{
  replay: []
  setup: []
  lobby: []
}>()
</script>

<template>
  <van-overlay :show="show" z-index="2000">
    <div class="game-end" @click.stop>
      <div class="game-end__card">
        <div class="game-end__icon">🏁</div>
        <h3 class="game-end__title">{{ title ?? '对局结束' }}</h3>
        <p v-if="gameName" class="game-end__game">{{ gameName }}</p>
        <p v-if="message" class="game-end__msg">{{ message }}</p>
        <div class="game-end__actions">
          <van-button type="primary" block round @click="emit('replay')">再来一局</van-button>
          <van-button plain block round @click="emit('setup')">重新配置</van-button>
          <van-button block round @click="emit('lobby')">返回大厅</van-button>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<style scoped>
.game-end {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

.game-end__card {
  width: min(320px, 100%);
  background: var(--color-card);
  border-radius: 16px;
  padding: 28px 20px 20px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.game-end__icon {
  font-size: 48px;
  line-height: 1;
}

.game-end__title {
  margin: 12px 0 4px;
  font-size: 20px;
  color: var(--color-text);
}

.game-end__game {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.game-end__msg {
  margin: 12px 0 20px;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.game-end__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
