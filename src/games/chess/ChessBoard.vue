<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameLayout from '@/layouts/GameLayout.vue'
import GameInfoPanel from '@/components/game/GameInfoPanel.vue'
import { useRoomStore } from '@/stores/room'
import { useHotseat } from '@/composables/useHotseat'
import { useGameFlow } from '@/composables/useGameFlow'
import {
  applyMove,
  getMoves,
  initialBoard,
  pieceSymbol,
  type Board,
  type Color,
} from './engine'
import { createChessBot } from './bots/chessBot'
import { runBotTurn } from '@/bots/botScheduler'

const roomStore = useRoomStore()
const gameFlow = useGameFlow('chess')
const board = ref<Board>(initialBoard())
const turn = ref<Color>('white')
const selected = ref<[number, number] | null>(null)
const lastMove = ref<{ from: [number, number]; to: [number, number] } | null>(null)
const botThinking = ref(false)
const moveLog = ref<string[]>([])

const players = computed(() => roomStore.setup?.players ?? [])
const hotseat = useHotseat(() => players.value)
const myColor = ref<Color>('white')
const botColor = computed<Color>(() => (myColor.value === 'white' ? 'black' : 'white'))

const isMyTurn = computed(() => {
  const p = players.value[0]
  return p?.type === 'human' && turn.value === myColor.value && hotseat.canOperate(0)
})

const noticeText = computed(() => {
  if (botThinking.value) return '机器人思考中…'
  if (isMyTurn.value) return '轮到您行棋'
  if (hotseat.passDeviceHint.value) return hotseat.passDeviceHint.value
  return turn.value === 'white' ? '白方行棋' : '黑方行棋'
})

function cellClasses(x: number, y: number) {
  const moves = selected.value ? getMoves(board.value, selected.value[0], selected.value[1]) : []
  const hint = moves.find(([mx, my]) => mx === x && my === y)
  const target = hint ? board.value[y]![x] : null
  const isLast =
    (lastMove.value?.from[0] === x && lastMove.value?.from[1] === y) ||
    (lastMove.value?.to[0] === x && lastMove.value?.to[1] === y)
  return {
    'chess-cell--light': (x + y) % 2 === 0,
    'chess-cell--dark': (x + y) % 2 === 1,
    'chess-cell--selected': selected.value?.[0] === x && selected.value?.[1] === y,
    'chess-cell--hint': !!hint,
    'chess-cell--capture': !!hint && !!target,
    'chess-cell--last': isLast,
  }
}

function onCell(x: number, y: number) {
  if (!isMyTurn.value) return
  const piece = board.value[y]![x]
  if (selected.value) {
    const [fx, fy] = selected.value
    const moves = getMoves(board.value, fx, fy)
    if (moves.some(([mx, my]) => mx === x && my === y)) {
      const moving = board.value[fy]![fx]
      board.value = applyMove(board.value, fx, fy, x, y)
      lastMove.value = { from: [fx, fy], to: [x, y] }
      if (moving) moveLog.value.unshift(`${pieceSymbol(moving)} → ${String.fromCharCode(97 + x)}${8 - y}`)
      turn.value = turn.value === 'white' ? 'black' : 'white'
      selected.value = null
      hotseat.advanceAfterHumanAction(0)
      runBotIfNeeded()
      return
    }
  }
  if (piece && piece.color === myColor.value) selected.value = [x, y]
  else selected.value = null
}

async function runBotIfNeeded() {
  const botPlayer = players.value.find((p) => p.type === 'bot')
  if (!botPlayer || turn.value !== botColor.value) return
  botThinking.value = true
  const bot = createChessBot(botPlayer.botDifficulty ?? 'medium')
  const action = await runBotTurn(botPlayer.botDifficulty ?? 'medium', () =>
    bot.decide({ board: board.value, color: botColor.value }, 1),
  )
  if (action) {
    const p = board.value[action.from[1]]![action.from[0]]
    board.value = applyMove(
      board.value,
      action.from[0],
      action.from[1],
      action.to[0],
      action.to[1],
    )
    lastMove.value = { from: action.from, to: action.to }
    if (p) {
      moveLog.value.unshift(`AI: ${pieceSymbol(p)} → ${String.fromCharCode(97 + action.to[0])}${8 - action.to[1]}`)
    }
    turn.value = myColor.value
  }
  botThinking.value = false
}

onMounted(() => {
  if (!gameFlow.ensureSetup()) return
  if (players.value[0]?.type === 'bot') {
    myColor.value = 'black'
    turn.value = 'white'
  }
  runBotIfNeeded()
})
</script>

<template>
  <GameLayout
    title="国际象棋"
    game-id="chess"
    @back="gameFlow.confirmExit"
    @setup="gameFlow.goSetup"
    @lobby="gameFlow.goLobby"
  >
    <template #sidebar>
      <GameInfoPanel title="对局信息">
        <p>您执：{{ myColor === 'white' ? '白方 ♔' : '黑方 ♚' }}</p>
        <p>{{ turn === 'white' ? '白方行棋' : '黑方行棋' }}</p>
        <h4 style="margin: 12px 0 8px">棋谱</h4>
        <van-cell v-for="(m, i) in moveLog.slice(0, 12)" :key="i" :title="m" />
      </GameInfoPanel>
    </template>

    <div class="game-table chess-game">
      <van-notice-bar :text="noticeText" />
      <div class="chess-board-wrap">
        <div class="chess-board">
          <template v-for="y in 8" :key="y">
            <button
              v-for="x in 8"
              :key="`${x}-${y}`"
              type="button"
              class="chess-cell"
              :class="cellClasses(x - 1, y - 1)"
              @click="onCell(x - 1, y - 1)"
            >
              <span
                v-if="board[y - 1]![x - 1]"
                class="chess-piece"
                :class="'chess-piece--' + board[y - 1]![x - 1]!.color"
              >
                {{ pieceSymbol(board[y - 1]![x - 1]!) }}
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.chess-game {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
