<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LobbyLayout from '@/layouts/LobbyLayout.vue'
import GameIcon from '@/components/lobby/GameIcon.vue'
import { getGame } from '@/data/games'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import type { BotDifficulty } from '@/bots/BotPlayer'
import { SEAT_NAMES, SEAT_NAMES_3 } from '@/types/player'
import { RoomStorage, setRoomInUrl } from '@/utils/roomStorage'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const settingsStore = useSettingsStore()

const gameId = computed(() => route.params.gameId as string)
const game = computed(() => getGame(gameId.value))

const humanCount = ref(1)
const autoFillBots = ref(true)
const botDifficulty = ref<BotDifficulty>(settingsStore.defaultBotDifficulty)
const showPicker = ref(false)
const playMode = ref<'local' | 'room'>('local')
const roomIdInput = ref('')

const difficultyActions = [
  { name: 'easy', text: '简单' },
  { name: 'medium', text: '中等' },
  { name: 'hard', text: '困难' },
]

const seatNames = computed(() =>
  game.value?.maxPlayers === 3 ? SEAT_NAMES_3 : SEAT_NAMES,
)

const previewPlayers = computed(() => {
  if (!game.value) return []
  const max = game.value.maxPlayers
  const list: string[] = []
  for (let i = 0; i < max; i++) {
    if (i < humanCount.value) {
      list.push(`${seatNames.value[i] ?? i}: 玩家${i + 1}`)
    } else if (autoFillBots.value) {
      list.push(`${seatNames.value[i] ?? i}: AI (${botDifficulty.value})`)
    } else {
      list.push(`${seatNames.value[i] ?? i}: 等待加入`)
    }
  }
  return list
})

function onSelectDifficulty(action: { name: string }) {
  botDifficulty.value = action.name as BotDifficulty
  showPicker.value = false
}

function createRoom() {
  if (!game.value) return
  const id = RoomStorage.createRoom(game.value.id, { created: Date.now() })
  setRoomInUrl(id)
  roomIdInput.value = id
  showToast(`房间已创建：${id}`)
}

function startGame() {
  if (!game.value) return
  roomStore.saveSetup(
    game.value.id,
    humanCount.value,
    game.value.maxPlayers,
    autoFillBots.value,
    botDifficulty.value,
  )
  if (playMode.value === 'room' && roomIdInput.value) {
    setRoomInUrl(roomIdInput.value)
  }
  if (game.value.id === 'mahjong') {
    router.push({ name: 'mahjong-rules' })
  } else {
    const routes: Record<string, string> = {
      doudizhu: 'doudizhu-play',
      gomoku: 'gomoku-play',
    }
    router.push({ name: routes[game.value.id] })
  }
}
</script>

<template>
  <LobbyLayout :title="game?.name ?? '游戏设置'">
    <van-nav-bar left-arrow @click-left="router.push('/')" />
    <template v-if="game">
      <div class="lobby-setup-hero" :style="{ '--game-accent': game.color }">
        <GameIcon :game-id="game.id" :size="48" />
        <div>
          <h2>{{ game.name }}</h2>
          <p>{{ game.description }}</p>
        </div>
      </div>
      <van-cell-group inset title="对局模式">
        <van-cell title="模式">
          <template #value>
            <van-radio-group v-model="playMode" direction="horizontal">
              <van-radio name="local">本地</van-radio>
              <van-radio name="room">房间</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <template v-if="playMode === 'room'">
          <van-field v-model="roomIdInput" label="房间号" placeholder="输入或创建" />
          <van-cell title="创建房间" is-link @click="createRoom" />
        </template>
      </van-cell-group>

      <van-cell-group inset title="玩家配置" style="margin-top: 12px">
        <van-cell title="真人数量">
          <template #value>
            <van-stepper v-model="humanCount" :min="1" :max="game.maxPlayers" />
          </template>
        </van-cell>
        <van-cell title="空位 AI 补位">
          <template #right-icon>
            <van-switch v-model="autoFillBots" size="20" />
          </template>
        </van-cell>
        <van-cell
          title="AI 难度"
          is-link
          :value="difficultyActions.find((d) => d.name === botDifficulty)?.text"
          @click="showPicker = true"
        />
      </van-cell-group>

      <van-cell-group inset title="座位预览" style="margin-top: 12px">
        <van-cell v-for="(p, i) in previewPlayers" :key="i" :title="p" />
      </van-cell-group>

      <van-notice-bar
        v-if="humanCount > 1"
        text="热座模式：多位真人请同设备轮流操作"
        style="margin-top: 12px"
      />

      <div class="lobby-start-btn">
        <van-button type="primary" block round size="large" @click="startGame">
          {{ game.id === 'mahjong' ? '下一步 · 选择规则' : '开始对局' }}
        </van-button>
      </div>
    </template>

    <van-action-sheet
      v-model:show="showPicker"
      :actions="difficultyActions"
      cancel-text="取消"
      @select="onSelectDifficulty"
    />
  </LobbyLayout>
</template>
