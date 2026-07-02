<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import GameLayout from '@/layouts/GameLayout.vue'
import GameEndDialog from '@/components/game/GameEndDialog.vue'
import GameInfoPanel from '@/components/game/GameInfoPanel.vue'
import HandRow from '@/components/HandRow.vue'
import PlayerHandDock from '@/components/game/PlayerHandDock.vue'
import GameActionBar from '@/components/game/GameActionBar.vue'
import type { GameAction } from '@/components/game/GameActionBar.vue'
import CardTile from './components/CardTile.vue'
import TileBack from './components/TileBack.vue'
import { useRoomStore } from '@/stores/room'
import { useHotseat } from '@/composables/useHotseat'
import { useGameFlow } from '@/composables/useGameFlow'
import { getActiveRule } from './rules/presets'
import { applyAction, canHu, createGame, drawTile } from './engine/engine'
import type { MahjongState, Suit, Tile } from './types/ruleConfig'
import { createMahjongBot } from './bots/mahjongBot'
import { describeMahjongHint, suggestDiscard } from './hints'
import { runBotTurn } from '@/bots/botScheduler'
import { showToast } from 'vant'

const roomStore = useRoomStore()
const gameFlow = useGameFlow('mahjong')

const state = ref<MahjongState | null>(null)
const selectedTile = ref<Tile | null>(null)
const playHint = ref<string | null>(null)
const botThinking = ref(false)
const queMenSuit = ref<Suit>('wan')
const showEnd = ref(false)
const endMessage = ref('')
const moveLog = ref<string[]>([])

const players = computed(() => roomStore.setup?.players ?? [])
const ruleName = computed(() => getActiveRule().name)

const localSeat = computed(() => {
  const idx = players.value.findIndex((p) => p.type === 'human')
  return idx >= 0 ? idx : 0
})

const hotseat = useHotseat(() => players.value)
const currentPlayer = computed(() => players.value[state.value?.currentSeat ?? 0])

const pendingQueMenSeat = computed(() => {
  if (!state.value || state.value.phase !== 'queMen') return -1
  for (const h of hotseat.humanSeats.value) {
    if (state.value.queMen[h.index] === null && hotseat.canOperate(h.index)) return h.index
  }
  return -1
})

const showQueMenPanel = computed(
  () => state.value?.phase === 'queMen' && pendingQueMenSeat.value >= 0,
)

const isMyTurn = computed(() => {
  const seat = state.value?.currentSeat ?? -1
  return (
    state.value &&
    state.value.phase === 'playing' &&
    !state.value.winners.includes(seat) &&
    players.value[seat]?.type === 'human' &&
    hotseat.canOperate(seat)
  )
})

const operatingSeat = computed(() => state.value?.currentSeat ?? localSeat.value)

const myHandDisplay = computed(() => {
  if (!state.value) return []
  if (showQueMenPanel.value && pendingQueMenSeat.value >= 0) {
    return state.value.hands[pendingQueMenSeat.value] ?? []
  }
  return state.value.hands[localSeat.value] ?? []
})

const handInteractive = computed(
  () => isMyTurn.value || showQueMenPanel.value,
)

const handWaiting = computed(
  () => state.value?.phase === 'playing' && !isMyTurn.value && !showQueMenPanel.value,
)

const mjActions = computed((): GameAction[] => {
  if (showQueMenPanel.value) {
    return [{ key: 'queMen', text: '确认定缺', type: 'primary' }]
  }
  if (isMyTurn.value) {
    return [
      { key: 'hint', text: '提示', type: 'default' },
      { key: 'hu', text: '胡', type: 'warning' },
      {
        key: 'discard',
        text: '出牌',
        type: 'primary',
        disabled: !selectedTile.value,
      },
    ]
  }
  return []
})

function onMjAction(key: string) {
  if (key === 'queMen') confirmQueMen()
  else if (key === 'hint') applyPlayHint()
  else if (key === 'hu') tryHu()
  else if (key === 'discard') discardSelected()
}

function refreshPlayHint() {
  if (!state.value || !isMyTurn.value) {
    playHint.value = null
    return
  }
  playHint.value = describeMahjongHint(state.value, operatingSeat.value)
}

function applyPlayHint() {
  if (!state.value || !isMyTurn.value) return
  if (canHu(state.value, operatingSeat.value)) {
    showToast('可以胡牌')
    tryHu()
    return
  }
  const tile = suggestDiscard(state.value, operatingSeat.value)
  if (!tile) return
  selectedTile.value = tile
  playHint.value = describeMahjongHint(state.value, operatingSeat.value)
  showToast('已选中推荐牌')
}

const noticeText = computed(() => {
  if (!state.value) return '加载中…'
  if (state.value.phase === 'ended') return '对局结束'
  if (showQueMenPanel.value) return '请选择定缺（缺一门）'
  if (botThinking.value) return '机器人思考中…'
  if (hotseat.passDeviceHint.value && currentPlayer.value?.type === 'human') {
    return hotseat.passDeviceHint.value
  }
  if (currentPlayer.value?.type === 'bot') return `${currentPlayer.value.name} 出牌中`
  if (isMyTurn.value) return '请出牌'
  return `等待 ${currentPlayer.value?.name ?? '玩家'}`
})

/** 相对本地玩家的方位：0=我 1=下家(右) 2=对家(上) 3=上家(左) */
function relativeOffset(seat: number): number {
  return (seat - localSeat.value + 4) % 4
}

function tablePos(seat: number): 'north' | 'east' | 'west' | null {
  const off = relativeOffset(seat)
  if (off === 0) return null
  if (off === 1) return 'east'
  if (off === 2) return 'north'
  return 'west'
}

function relativeLabel(seat: number): string {
  return ['我', '下家', '对家', '上家'][relativeOffset(seat)] ?? ''
}

function isHorizontalHand(seat: number): boolean {
  return tablePos(seat) === 'north'
}

function log(msg: string) {
  moveLog.value.unshift(msg)
  if (moveLog.value.length > 20) moveLog.value.pop()
}

function initGame() {
  selectedTile.value = null
  showEnd.value = false
  state.value = createGame(getActiveRule(), players.value.length || 4)
  log(`${ruleName.value} · 游戏开始`)
  if (state.value.phase === 'queMen') void processAllBotQueMen()
  else void processBotTurns()
}

function finishGame(msg: string) {
  endMessage.value = msg
  showEnd.value = true
}

async function processAllBotQueMen() {
  if (!state.value || state.value.phase !== 'queMen') return
  let s = state.value
  for (let seat = 0; seat < players.value.length; seat++) {
    if (s.queMen[seat] !== null) continue
    const player = players.value[seat]
    if (player?.type !== 'bot') continue
    botThinking.value = true
    const bot = createMahjongBot(player.botDifficulty ?? 'hard')
    const action = await runBotTurn(player.botDifficulty ?? 'hard', () => bot.decide(s, seat))
    s = applyAction(s, action)
    log(`${player.name} 定缺 ${action.suit ?? ''}`)
    botThinking.value = false
  }
  state.value = s
  if (s.phase === 'playing') await processBotTurns()
}

async function processBotTurns() {
  if (!state.value || state.value.phase === 'ended') return
  if (state.value.phase === 'queMen') {
    await processAllBotQueMen()
    return
  }

  let s = state.value
  let seat = s.currentSeat
  let guard = 0
  while (s.winners.includes(seat) && guard < s.hands.length) {
    seat = (seat + 1) % s.hands.length
    guard++
  }
  if (s.winners.includes(seat)) return

  const player = players.value[seat]
  if (!player || player.type !== 'bot') return

  botThinking.value = true
  let ns = s
  if (ns.hands[seat]!.length % 3 === 1) ns = drawTile(ns, seat)
  const bot = createMahjongBot(player.botDifficulty ?? 'hard')
  const action = await runBotTurn(player.botDifficulty ?? 'hard', () => bot.decide(ns, seat))
  state.value = applyAction(ns, action)
  if (action.type === 'discard' && action.tile) {
    log(`${player.name} 打出 ${action.tile.suit}${action.tile.rank}`)
  }
  if (action.type === 'hu') log(`${player.name} 胡牌`)
  botThinking.value = false
  if (state.value?.phase !== 'ended') await processBotTurns()
}

function confirmQueMen() {
  if (!state.value || pendingQueMenSeat.value < 0) return
  const seat = pendingQueMenSeat.value
  state.value = applyAction(state.value, { type: 'queMen', seat, suit: queMenSuit.value })
  log(`${players.value[seat]?.name} 定缺 ${queMenSuit.value}`)
  void processAllBotQueMen()
}

function onSelectTile(tile: Tile) {
  if (!isMyTurn.value) return
  selectedTile.value = selectedTile.value?.id === tile.id ? null : tile
}

function discardSelected() {
  if (!state.value || !selectedTile.value || !isMyTurn.value) return
  const seat = operatingSeat.value
  let ns = state.value
  if (ns.hands[seat]!.length % 3 === 1) ns = drawTile(ns, seat)
  state.value = applyAction(ns, { type: 'discard', seat, tile: selectedTile.value })
  log(`打出 ${selectedTile.value.suit}${selectedTile.value.rank}`)
  selectedTile.value = null
  playHint.value = null
  hotseat.advanceAfterHumanAction(seat)
  processBotTurns()
}

function tryHu() {
  const seat = operatingSeat.value
  if (!state.value || !canHu(state.value, seat)) {
    showToast('不能胡牌')
    return
  }
  state.value = applyAction(state.value, { type: 'hu', seat })
  log('胡牌！')
}

function handleReplay() {
  showEnd.value = false
  initGame()
}

onMounted(() => {
  if (!gameFlow.ensureSetup()) return
  initGame()
})

watch(
  () => [state.value?.currentSeat, state.value?.phase, isMyTurn.value] as const,
  () => refreshPlayHint(),
)

watch(
  () => state.value?.currentSeat,
  (seat) => {
    if (seat !== undefined && players.value[seat]?.type === 'human') {
      hotseat.activeSeat.value = seat
    }
  },
)

watch(
  () => state.value?.phase,
  (p) => {
    if (p === 'ended') {
      const names = state.value?.winners.map((i) => players.value[i]?.name).join('、')
      finishGame(names ? `胡牌：${names}` : '流局')
    }
  },
)
</script>

<template>
  <GameLayout
    title="麻将"
    game-id="mahjong"
    landscape
    @back="gameFlow.confirmExit"
    @setup="gameFlow.goSetup"
    @lobby="gameFlow.goLobby"
  >
    <template #sidebar>
      <GameInfoPanel title="对局信息">
        <p>规则：{{ ruleName }}</p>
        <p>剩余牌：{{ state?.wall.length ?? 0 }}</p>
        <h4 style="margin: 12px 0 8px">记录</h4>
        <van-cell v-for="(m, i) in moveLog.slice(0, 10)" :key="i" :title="m" />
      </GameInfoPanel>
    </template>

    <div class="game-table mahjong-table card-game-layout card-game-layout--landscape">
      <div class="card-game-layout__arena">
        <van-notice-bar scrollable :text="noticeText" />

        <template v-if="state">
          <div class="mj-table">
            <template v-for="(p, i) in players" :key="p.id">
              <div
                v-if="tablePos(i)"
                :class="[
                  'mj-player-chip',
                  `mj-table__${tablePos(i)}`,
                  { 'mj-player-chip--active': state.currentSeat === i && state.phase === 'playing' },
                ]"
              >
                <span class="mj-player-chip__name">{{ relativeLabel(i) }} · {{ p.name }}</span>
                <span class="mj-player-chip__meta">
                  <template v-if="state.queMen[i]">
                    缺{{ { wan: '万', tiao: '条', tong: '筒' }[state.queMen[i]!] }}
                  </template>
                  · {{ state.hands[i]?.length ?? 0 }}张
                </span>
                <TileBack
                  v-if="p.type === 'bot' || i !== localSeat"
                  :horizontal="isHorizontalHand(i)"
                  :count="state.hands[i]?.length ?? 0"
                />
              </div>
            </template>

            <div class="mj-table__center">
              <div class="mj-wall-info">{{ ruleName }} · 余 {{ state.wall.length }} 张</div>
              <div class="mj-discard-grid">
                <div v-for="i in players.length" :key="'d' + i" class="mj-discard-row">
                  <span class="mj-discard-row__label">{{ relativeLabel(i - 1) }}</span>
                  <CardTile
                    v-for="t in state.discards[i - 1]?.slice(-10)"
                    :key="t.id"
                    :tile="t"
                    small
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <PlayerHandDock
        v-if="state && state.phase !== 'ended'"
        class="mj-hand-dock"
        theme="mahjong"
        title="我的手牌"
        :count="myHandDisplay.length"
        :hint="playHint ?? undefined"
        :subtitle="hotseat.passDeviceHint.value || undefined"
        :active="handInteractive"
        :waiting="handWaiting"
      >
        <HandRow v-if="myHandDisplay.length" fit :count="myHandDisplay.length">
          <CardTile
            v-for="t in myHandDisplay"
            :key="t.id"
            :tile="t"
            hand
            :selected="selectedTile?.id === t.id"
            :dimmed="!handInteractive"
            @click="handInteractive ? onSelectTile(t) : undefined"
          />
        </HandRow>
        <p v-else class="mj-hand-empty">加载手牌…</p>
        <template v-if="showQueMenPanel || mjActions.length" #actions>
          <div v-if="showQueMenPanel" class="mj-que-men-dock">
            <p>请选择定缺（须先打完缺门才能胡）</p>
            <van-radio-group
              v-model="queMenSuit"
              direction="horizontal"
              class="mj-que-men-suits"
            >
              <van-radio name="wan">万</van-radio>
              <van-radio name="tiao">条</van-radio>
              <van-radio name="tong">筒</van-radio>
            </van-radio-group>
          </div>
          <GameActionBar v-if="mjActions.length" :actions="mjActions" @action="onMjAction" />
        </template>
      </PlayerHandDock>
    </div>

    <GameEndDialog
      :show="showEnd"
      game-name="麻将"
      :message="endMessage"
      @replay="handleReplay"
      @setup="gameFlow.goSetup"
      @lobby="gameFlow.goLobby"
    />
  </GameLayout>
</template>

<style scoped>
.mahjong-table {
  min-height: 0;
}

.mj-hand-empty {
  margin: 0;
  padding: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.mj-que-men-dock {
  padding: 0 0 8px;
}

.mj-que-men-dock p {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.mj-hand-dock {
  width: 100%;
}
</style>
