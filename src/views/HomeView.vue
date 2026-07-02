<script setup lang="ts">
import { useRouter } from 'vue-router'
import LobbyLayout from '@/layouts/LobbyLayout.vue'
import GameIcon from '@/components/lobby/GameIcon.vue'
import { GAMES } from '@/data/games'

const router = useRouter()

function openGame(id: string) {
  router.push({ name: 'setup', params: { gameId: id } })
}
</script>

<template>
  <LobbyLayout title="棋牌乐园">
    <div class="lobby-hero">
      <h1>选择游戏</h1>
      <p>全免费 · 本地 AI · 随时开玩</p>
    </div>
    <van-grid :column-num="2" :gutter="12" :border="false">
      <van-grid-item v-for="game in GAMES" :key="game.id" @click="openGame(game.id)">
        <div
          class="lobby-game-card"
          :style="{ '--game-accent': game.color }"
          role="button"
          tabindex="0"
          @keydown.enter="openGame(game.id)"
        >
          <div class="lobby-game-card__icon-wrap">
            <GameIcon :game-id="game.id" :size="52" />
          </div>
          <span class="lobby-game-card__name">{{ game.name }}</span>
          <div class="lobby-game-card__tags">
            <van-tag
              v-for="tag in game.tags"
              :key="tag"
              round
              plain
              size="medium"
              :color="game.color"
            >
              {{ tag }}
            </van-tag>
          </div>
          <p class="lobby-game-card__desc">{{ game.description }}</p>
        </div>
      </van-grid-item>
    </van-grid>
  </LobbyLayout>
</template>

<style scoped>
:deep(.van-grid-item__content) {
  padding: 6px;
  background: transparent;
}

:deep(.van-grid-item__content::after) {
  border: none;
}
</style>
