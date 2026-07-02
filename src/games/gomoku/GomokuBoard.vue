<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameLayout from '@/layouts/GameLayout.vue'
import GameEndDialog from '@/components/game/GameEndDialog.vue'
import GameInfoPanel from '@/components/game/GameInfoPanel.vue'
import { useRoomStore } from '@/stores/room'
import { useHotseat } from '@/composables/useHotseat'
import { useGameFlow } from '@/composables/useGameFlow'
import { describeGomokuHint, suggestMove } from './hints'
import { checkWin, createBoard, type Cell } from './engine'
import { createGomokuBot } from './bots/gomokuBot'
import { runBotTurn } from '@/bots/botScheduler'

const STARS = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
]

function isStar(r: number, c: number): boolean {
  return STARS.some(([sr, sc]) => sr === r && sc === c)
}

const roomStore = useRoomStore()
const gameFlow = useGameFlow('gomoku')
const board = ref<Cell[][]>(createBoard())
const turn = ref<1 | 2>(1)
const winner = ref<0 | 1 | 2>(0)
const botThinking = ref(false)
const lastMove = ref<[number, number] | null>(null)
const hintPoint = ref<[number, number] | null>(null)
const playHint = ref<string | null>(null)
const showEnd = ref(false)
const endMessage = ref('')

const players = computed(() => roomStore.setup?.players ?? [])
const hotseat = useHotseat(() => players.value)
const humanPlayer = ref<1 | 2>(1)
const humanSeat = ref(0)

const isMyTurn = computed(
  () =>
    !winner.value &&
    turn.value === humanPlayer.value &&
    hotseat.canOperate(humanSeat.value),
)

const noticeText = computed(() => {
  if (botThinking.value) return '机器人思考中…'
  if (winner.value) return '对局结束'
  if (isMyTurn.value) return '请落子'
  if (hotseat.passDeviceHint.value) return hotseat.passDeviceHint.value
  return 'AI 落子'
})

function applyHint() {
  if (!isMyTurn.value || winner.value) return
  const [r, c] = suggestMove(board.value, humanPlayer.value)
  hintPoint.value = [r, c]
  playHint.value = describeGomokuHint(board.value, humanPlayer.value)
}

async function place(row: number, col: number) {
  if (board.value[row]![col] !== 0 || winner.value || !isMyTurn.value) return

  hintPoint.value = null
  playHint.value = null

  board.value[row]![col] = humanPlayer.value
  lastMove.value = [row, col]
  if (checkWin(board.value, row, col, humanPlayer.value)) {
    winner.value = humanPlayer.value
    endMessage.value = '恭喜，您获胜！'
    showEnd.value = true
    return
  }
  turn.value = humanPlayer.value === 1 ? 2 : 1
  hotseat.advanceAfterHumanAction(humanSeat.value)
  await runBot()
}

async function runBot() {
  const bot = players.value.find((p) => p.type === 'bot')
  if (!bot || winner.value || turn.value === humanPlayer.value) return
  botThinking.value = true
  const gBot = createGomokuBot(bot.botDifficulty ?? 'hard')
  const [r, c] = await runBotTurn(bot.botDifficulty ?? 'hard', () =>
    gBot.decide({ board: board.value, player: turn.value as 1 | 2 }, 1),
  )
  board.value[r]![c] = turn.value
  lastMove.value = [r, c]
  if (checkWin(board.value, r, c, turn.value as 1 | 2)) {
    winner.value = turn.value
    endMessage.value = 'AI 获胜'
    showEnd.value = true
  } else {
    turn.value = humanPlayer.value
  }
  botThinking.value = false
}

function initGame() {
  board.value = createBoard()
  winner.value = 0
  turn.value = 1
  lastMove.value = null
  hintPoint.value = null
  playHint.value = null
  showEnd.value = false
  humanPlayer.value = 1
  humanSeat.value = 0
  if (players.value[0]?.type === 'bot') {
    humanPlayer.value = 2
    humanSeat.value = 1
    turn.value = 1
    void runBot()
  }
}

function handleReplay() {
  initGame()
}

onMounted(() => {
  if (!gameFlow.ensureSetup()) return
  initGame()
})
</script>

<template>
  <GameLayout
    title="五子棋"
    game-id="gomoku"
    @back="gameFlow.confirmExit"
    @setup="gameFlow.goSetup"
    @lobby="gameFlow.goLobby"
  >
    <template #sidebar>
      <GameInfoPanel title="对局信息">
        <p>您执：{{ humanPlayer === 1 ? '黑棋 ⚫' : '白棋 ⚪' }}</p>
        <p v-if="winner">胜者：{{ winner === 1 ? '黑棋' : '白棋' }}</p>
        <p v-else>{{ turn === 1 ? '黑棋行棋' : '白棋行棋' }}</p>
      </GameInfoPanel>
    </template>

    <div class="game-table gomoku-game">
      <div class="gomoku-top-bar">
        <div class="gomoku-notice-wrap">
          <van-notice-bar scrollable :text="noticeText" />
        </div>
        <p class="gomoku-hint-line">{{ playHint ?? '' }}</p>
      </div>

      <div class="gomoku-board-wrap">
        <button
          v-show="isMyTurn && !winner"
          type="button"
          class="gomoku-hint-fab"
          aria-label="提示落子"
          @click="applyHint"
        >
          提示落子
        </button>

        <div class="gomoku-board">
          <div class="gomoku-grid">
            <template v-for="r in 15" :key="'r' + r">
              <button
                v-for="c in 15"
                :key="`${r}-${c}`"
                type="button"
                class="gomoku-point"
                :class="{
                  'gomoku-point--star': isStar(r - 1, c - 1),
                  'gomoku-point--last':
                    lastMove?.[0] === r - 1 && lastMove?.[1] === c - 1,
                  'gomoku-point--hint':
                    hintPoint?.[0] === r - 1 && hintPoint?.[1] === c - 1,
                }"
                @click="place(r - 1, c - 1)"
              >
                <span
                  v-if="board[r - 1]![c - 1]"
                  class="gomoku-stone"
                  :class="
                    board[r - 1]![c - 1] === 1 ? 'gomoku-stone--black' : 'gomoku-stone--white'
                  "
                />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <GameEndDialog
      :show="showEnd"
      game-name="五子棋"
      :message="endMessage"
      @replay="handleReplay"
      @setup="gameFlow.goSetup"
      @lobby="gameFlow.goLobby"
    />
  </GameLayout>
</template>

<style scoped>
.gomoku-game {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.gomoku-top-bar {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  flex-direction: column;
}

.gomoku-notice-wrap {
  height: 40px;
  flex-shrink: 0;
  overflow: hidden;
}

.gomoku-notice-wrap :deep(.van-notice-bar) {
  height: 40px;
}

.gomoku-hint-line {
  height: 24px;
  margin: 0;
  padding: 0 12px;
  font-size: 12px;
  line-height: 24px;
  color: #ffe082;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.gomoku-board-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.gomoku-hint-fab {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 6;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.gomoku-hint-fab:active {
  transform: scale(0.96);
}
</style>
