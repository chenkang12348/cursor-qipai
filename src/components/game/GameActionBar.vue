<script setup lang="ts">
export interface GameAction {
  key: string
  text: string
  type?: 'primary' | 'default' | 'warning' | 'danger'
  disabled?: boolean
}

defineProps<{
  actions: GameAction[]
}>()

const emit = defineEmits<{ action: [key: string] }>()
</script>

<template>
  <div class="game-action-bar">
    <button
      v-for="act in actions"
      :key="act.key"
      type="button"
      class="game-action-bar__btn"
      :class="[
        `game-action-bar__btn--${act.type ?? 'default'}`,
        { 'game-action-bar__btn--disabled': act.disabled },
      ]"
      :disabled="act.disabled"
      @click="emit('action', act.key)"
    >
      {{ act.text }}
    </button>
  </div>
</template>

<style scoped>
.game-action-bar {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.game-action-bar__btn {
  flex: 1;
  min-height: var(--touch-min, 44px);
  padding: 10px 12px;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-base);
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.game-action-bar__btn:active:not(:disabled) {
  transform: scale(0.96);
}

.game-action-bar__btn--default {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.game-action-bar__btn--primary {
  background: linear-gradient(180deg, #ffd54f 0%, #ff9800 100%);
  color: #3d2800;
  box-shadow: 0 2px 10px rgba(255, 152, 0, 0.5);
  font-weight: 700;
}

.game-action-bar__btn--warning {
  background: linear-gradient(180deg, #ff9800 0%, #e65100 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(230, 81, 0, 0.35);
}

.game-action-bar__btn--danger {
  background: linear-gradient(180deg, #ef5350 0%, #c62828 100%);
  color: #fff;
}

.game-action-bar__btn--disabled,
.game-action-bar__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.game-action-bar__btn--primary:not(:disabled):active {
  box-shadow: 0 1px 4px rgba(212, 160, 23, 0.3);
}
</style>
