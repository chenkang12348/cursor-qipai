<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameLayout from '@/layouts/GameLayout.vue'
import GameEndDialog from '@/components/game/GameEndDialog.vue'
import GameInfoPanel from '@/components/game/GameInfoPanel.vue'
import { useRoomStore } from '@/stores/room'
import { useHotseat } from '@/composables/useHotseat'
import { useGameFlow } from '@/composables/useGameFlow'
import {
  applyMove,
  getGameResult,
  getLegalMoves,
  initialBoard,
  isInCheck,
  isMoveLegal,
  pieceLabel,
  type Board,
  type Color,
  type GameResult,
} from './engine'
import { createXiangqiBot } from './bots/xiangqiBot'
import { runBotTurn } from '@/bots/botScheduler'
import { showToast } from 'vant'

const roomStore = useRoomStore()
const gameFlow = useGameFlow('xiangqi')

const board = ref<Board>(initialBoard())
const turn = ref<Color>('red')
const selected = ref<[number, number] | null>(null)
const lastMove = ref<{ from: [number, number]; to: [number, number] } | null>(null)
const botThinking = ref(false)
const moveLog = ref<string[]>([])
const gameResult = ref<GameResult>('playing')
const showEnd = ref(false)
const endMessage = ref('')

const players = computed(() => roomStore.setup?.players ?? [])
const hotseat = useHotseat(() => players.value)
const myColor = ref<Color>('red')
const botColor = computed<Color>(() => (myColor.value === 'red' ? 'black' : 'red'))

const isMyTurn = computed(() => {
  const p = players.value[0]
  return (
    p?.type === 'human' &&
    turn.value === myColor.value &&
    hotseat.canOperate(0) &&
    gameResult.value === 'playing'
  )
})

const redInCheck = computed(() => isInCheck(board.value, 'red'))
const blackInCheck = computed(() => isInCheck(board.value, 'black'))

const noticeText = computed(() => {
  if (gameResult.value === 'checkmate') return '对局结束'
  if (botThinking.value) return '机器人思考中…'
  if (isMyTurn.value) {
    if (isInCheck(board.value, myColor.value)) return '您被将军，请应将'
    return '轮到您行棋'
  }
  if (hotseat.passDeviceHint.value) return hotseat.passDeviceHint.value
  const side = turn.value
  if (isInCheck(board.value, side)) {
    return side === 'red' ? '红方被将军' : '黑方被将军'
  }
  return side === 'red' ? '红方行棋' : '黑方行棋'
})

function getCellPiece(x: number, y: number) {
  return board.value[y]?.[x] ?? null
}

function cellLabel(x: number, y: number): string {
  const p = getCellPiece(x, y)
  return p ? pieceLabel(p) : ''
}

function cellClass(x: number, y: number) {
  const moves = selected.value ? getLegalMoves(board.value, selected.value[0], selected.value[1]) : []
  const isHint = moves.some(([mx, my]) => mx === x && my === y)
  const isSelected = selected.value?.[0] === x && selected.value?.[1] === y
  const isLast =
    (lastMove.value?.from[0] === x && lastMove.value?.from[1] === y) ||
    (lastMove.value?.to[0] === x && lastMove.value?.to[1] === y)
  const piece = board.value[y]![x]
  const isKingInCheck =
    piece?.type === 'k' &&
    ((piece.color === 'red' && redInCheck.value) || (piece.color === 'black' && blackInCheck.value))
  return {
    'xq-cell--hint': isHint,
    'xq-cell--selected': isSelected,
    'xq-cell--last': isLast,
    'xq-cell--check': isKingInCheck,
  }
}

function finishGame(result: GameResult, winner?: Color) {
  gameResult.value = result
  if (result === 'checkmate' && winner) {
    endMessage.value = `${winner === 'red' ? '红方' : '黑方'}获胜（将死）`
  } else if (result === 'stalemate') {
    endMessage.value = '和棋（困毙）'
  }
  showEnd.value = true
}

function afterMove(nextTurn: Color) {
  const result = getGameResult(board.value, nextTurn)
  if (result !== 'playing') {
    const winner = result === 'checkmate' ? (nextTurn === 'red' ? 'black' : 'red') : undefined
    finishGame(result, winner)
    return false
  }
  turn.value = nextTurn
  return true
}

function onCell(x: number, y: number) {
  if (!isMyTurn.value) return
  const piece = board.value[y]![x]
  if (selected.value) {
    const [fx, fy] = selected.value
    if (!isMoveLegal(board.value, fx, fy, x, y)) {
      if (piece && piece.color === myColor.value) selected.value = [x, y]
      else selected.value = null
      return
    }
    const moving = board.value[fy]![fx]
    board.value = applyMove(board.value, fx, fy, x, y)
    lastMove.value = { from: [fx, fy], to: [x, y] }
    if (moving) moveLog.value.unshift(`${pieceLabel(moving)} → (${x + 1},${10 - y})`)
    selected.value = null
    hotseat.advanceAfterHumanAction(0)
    const next: Color = myColor.value === 'red' ? 'black' : 'red'
    if (afterMove(next)) runBotIfNeeded()
    return
  }
  if (piece && piece.color === myColor.value) {
    const legal = getLegalMoves(board.value, x, y)
    if (legal.length === 0) {
      showToast('该子暂无合法走法')
      return
    }
    selected.value = [x, y]
  } else {
    selected.value = null
  }
}

async function runBotIfNeeded() {
  const botPlayer = players.value.find((p) => p.type === 'bot')
  if (!botPlayer || turn.value !== botColor.value || gameResult.value !== 'playing') return
  botThinking.value = true
  const bot = createXiangqiBot(botPlayer.botDifficulty ?? 'medium')
  const action = await runBotTurn(botPlayer.botDifficulty ?? 'medium', () =>
    bot.decide({ board: board.value, color: botColor.value }, 1),
  )
  if (action && isMoveLegal(board.value, action.from[0], action.from[1], action.to[0], action.to[1])) {
    const p = board.value[action.from[1]]![action.from[0]]
    board.value = applyMove(
      board.value,
      action.from[0],
      action.from[1],
      action.to[0],
      action.to[1],
    )
    lastMove.value = { from: action.from, to: action.to }
    if (p) moveLog.value.unshift(`AI: ${pieceLabel(p)}`)
    afterMove(myColor.value)
  }
  botThinking.value = false
}

function initGame() {
  board.value = initialBoard()
  turn.value = 'red'
  selected.value = null
  lastMove.value = null
  gameResult.value = 'playing'
  showEnd.value = false
  moveLog.value = []
  if (players.value[0]?.type === 'bot') {
    myColor.value = 'black'
    turn.value = 'red'
  } else {
    myColor.value = 'red'
  }
  runBotIfNeeded()
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
    title="中国象棋"
    game-id="xiangqi"
    @back="gameFlow.confirmExit"
    @setup="gameFlow.goSetup"
    @lobby="gameFlow.goLobby"
  >
    <template #sidebar>
      <GameInfoPanel title="棋谱">
        <p>{{ turn === 'red' ? '红方行棋' : '黑方行棋' }}</p>
        <p v-if="redInCheck">红方 · 将军</p>
        <p v-if="blackInCheck">黑方 · 将军</p>
        <van-cell v-for="(m, i) in moveLog.slice(0, 12)" :key="i" :title="m" />
      </GameInfoPanel>
    </template>

    <div class="game-table xiangqi-game card-game-layout">
      <div class="card-game-layout__arena xiangqi-arena">
        <van-notice-bar scrollable :text="noticeText" />
        <div class="xq-board-wrap">
          <div class="xq-board">
            <div class="xq-board__river">
              <span>楚河 · 汉界</span>
            </div>
            <div class="xq-grid">
              <template v-for="y in 10" :key="'row-' + y">
                <button
                  v-for="x in 9"
                  :key="`${x}-${y}`"
                  type="button"
                  class="xq-cell"
                  :class="cellClass(x - 1, y - 1)"
                  @click="onCell(x - 1, y - 1)"
                >
                  <span
                    v-if="getCellPiece(x - 1, y - 1)"
                    class="xq-piece"
                    :class="'xq-piece--' + getCellPiece(x - 1, y - 1)?.color"
                  >
                    {{ cellLabel(x - 1, y - 1) }}
                  </span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <GameEndDialog
      :show="showEnd"
      game-name="中国象棋"
      :message="endMessage"
      @replay="handleReplay"
      @setup="gameFlow.goSetup"
      @lobby="gameFlow.goLobby"
    />
  </GameLayout>
</template>

<style scoped>
.xiangqi-game {
  min-height: 0;
}

.xiangqi-arena {
  justify-content: center;
}
</style>
