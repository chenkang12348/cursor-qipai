<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import GameLayout from '@/layouts/GameLayout.vue'
import GameEndDialog from '@/components/game/GameEndDialog.vue'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerBadge from '@/components/game/PlayerBadge.vue'
import PlayerHandDock from '@/components/game/PlayerHandDock.vue'
import GameActionBar from '@/components/game/GameActionBar.vue'
import type { GameAction } from '@/components/game/GameActionBar.vue'
import HandRow from '@/components/HandRow.vue'
import { useRoomStore } from '@/stores/room'
import { useHotseat } from '@/composables/useHotseat'
import { useGameFlow } from '@/composables/useGameFlow'
import {
  bidScore,
  cardIsRed,
  cardLabel,
  deal,
  playCards,
  setLandlord,
  validatePlay,
  type Card,
  type DoudizhuState,
} from './engine'
import { describePlayHint, suggestPlay } from './hints'
import { createDoudizhuBot } from './bots/doudizhuBot'
import { runBotTurn } from '@/bots/botScheduler'
import { showToast } from 'vant'

const roomStore = useRoomStore()
const gameFlow = useGameFlow('doudizhu')
const state = ref<DoudizhuState | null>(null)
const selected = ref<Set<string>>(new Set())
const playHint = ref<string | null>(null)
const bottomCards = ref<Card[]>([])
const botThinking = ref(false)
const showEnd = ref(false)
const endMessage = ref('')

const players = computed(() => roomStore.setup?.players ?? [])
const mySeat = computed(() => Math.max(0, players.value.findIndex((p) => p.type === 'human')))
const hotseat = useHotseat(() => players.value)
const myHand = computed(() => state.value?.hands[mySeat.value] ?? [])

const topSeat = computed(() => (mySeat.value + 1) % 3)
const leftSeat = computed(() => (mySeat.value + 2) % 3)

const isMyTurn = computed(
  () =>
    state.value?.phase === 'playing' &&
    state.value.currentSeat === mySeat.value &&
    hotseat.canOperate(mySeat.value),
)

const canBid = computed(
  () => state.value?.phase === 'bidding' && state.value.bids[mySeat.value] === null,
)

const noticeText = computed(() => {
  if (botThinking.value) return '机器人思考中…'
  if (hotseat.passDeviceHint.value) return hotseat.passDeviceHint.value
  if (state.value?.phase === 'bidding') return '叫地主阶段'
  if (state.value?.phase === 'ended') return '对局结束'
  return '出牌阶段'
})

const centerPlay = computed(() => state.value?.lastPlay ?? null)

const handActive = computed(
  () => isMyTurn.value || (state.value?.phase === 'bidding' && canBid.value),
)

const handWaiting = computed(
  () => state.value?.phase === 'playing' && !isMyTurn.value,
)

const ddzActions = computed((): GameAction[] => {
  if (state.value?.phase === 'bidding' && canBid.value) {
    return [
      { key: 'bid0', text: '不叫', type: 'default' },
      { key: 'bid1', text: '1 分', type: 'primary' },
      { key: 'bid2', text: '2 分', type: 'primary' },
      { key: 'bid3', text: '3 分', type: 'warning' },
    ]
  }
  if (state.value?.phase === 'playing' && isMyTurn.value) {
    return [
      { key: 'hint', text: '提示', type: 'default' as const },
      { key: 'pass', text: '不出', type: 'default' as const },
      {
        key: 'play',
        text: '出牌',
        type: 'primary' as const,
        disabled: selected.value.size === 0,
      },
    ]
  }
  return []
})

function onDdzAction(key: string) {
  if (key.startsWith('bid')) {
    myBid(Number(key.replace('bid', '')))
  } else if (key === 'hint') {
    applyPlayHint()
  } else if (key === 'pass') {
    passTurn()
  } else if (key === 'play') {
    playSelected()
  }
}

function resolveLandlord() {
  if (!state.value) return
  const maxBid = Math.max(...(state.value.bids as number[]))
  if (maxBid === 0) {
    showToast('三家均不叫，重新发牌')
    initGame()
    return
  }
  const ls = state.value.bids.indexOf(maxBid)
  state.value = setLandlord(state.value, ls >= 0 ? ls : mySeat.value, bottomCards.value)
  showToast(`地主：${players.value[state.value.landlord!]?.name}`)
  refreshPlayHint()
  processBots()
}

function refreshPlayHint() {
  if (state.value?.phase === 'playing' && isMyTurn.value) {
    const last = state.value.lastPlay?.seat === mySeat.value ? [] : (state.value.lastPlay?.cards ?? [])
    playHint.value = describePlayHint(myHand.value, last)
  } else {
    playHint.value = null
  }
}

function applyPlayHint() {
  if (!state.value || !isMyTurn.value) return
  const last = state.value.lastPlay?.seat === mySeat.value ? [] : (state.value.lastPlay?.cards ?? [])
  const pick = suggestPlay(myHand.value, last)
  if (!pick) {
    showToast('建议不出')
    playHint.value = describePlayHint(myHand.value, last)
    return
  }
  selected.value = new Set(pick.map((c) => c.id))
  playHint.value = describePlayHint(myHand.value, last)
  showToast('已选中推荐牌')
}

async function processBots() {
  if (!state.value || state.value.phase === 'ended') return
  const s = state.value
  const seat = s.currentSeat
  const p = players.value[seat]
  if (!p || p.type !== 'bot') return

  botThinking.value = true
  const diff = p.botDifficulty ?? 'hard'
  const bot = createDoudizhuBot(diff)

  if (s.phase === 'bidding') {
    const action = await runBotTurn(diff, () => bot.decide(s, seat))
    if (action.type === 'bid') {
      const bids = [...s.bids]
      bids[seat] = action.bid ?? 0
      state.value = { ...s, bids, currentSeat: (seat + 1) % 3 }
      if (state.value.bids.every((b) => b !== null)) {
        resolveLandlord()
        return
      }
    }
  } else {
    const action = await runBotTurn(diff, () => bot.decide(s, seat))
    if (action.type === 'pass') {
      state.value = playCards(s, seat, [])
    } else if (action.type === 'play' && action.cards) {
      state.value = playCards(s, seat, action.cards)
    }
  }
  botThinking.value = false
  refreshPlayHint()
  if (state.value?.phase !== 'ended') await processBots()
}

function toggleCard(id: string) {
  if (state.value?.phase === 'playing' && !isMyTurn.value) return
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selected.value = s
}

function myBid(score: number) {
  if (!state.value) return
  const bids = [...state.value.bids]
  bids[mySeat.value] = score
  state.value = { ...state.value, bids, currentSeat: (mySeat.value + 1) % 3 }
  if (state.value.bids.every((b) => b !== null)) {
    resolveLandlord()
    return
  }
  processBots()
}

function playSelected() {
  if (!state.value || !isMyTurn.value) return
  const cards = myHand.value.filter((c) => selected.value.has(c.id))
  if (!cards.length) return
  const last = state.value.lastPlay?.seat === mySeat.value ? [] : (state.value.lastPlay?.cards ?? [])
  const err = validatePlay(myHand.value, cards, last)
  if (err) {
    showToast(err)
    return
  }
  state.value = playCards(state.value, mySeat.value, cards)
  selected.value = new Set()
  playHint.value = null
  hotseat.advanceAfterHumanAction(mySeat.value)
  if (state.value.phase === 'ended') {
    const winner = players.value.find((_, i) => state.value!.hands[i]?.length === 0)
    endMessage.value = winner ? `${winner.name} 获胜` : '对局结束'
    showEnd.value = true
  } else processBots()
}

function passTurn() {
  if (!state.value || !isMyTurn.value) return
  if (!state.value.lastPlay) {
    showToast('首出不能不出')
    return
  }
  state.value = playCards(state.value, mySeat.value, [])
  playHint.value = null
  hotseat.advanceAfterHumanAction(mySeat.value)
  processBots()
}

function seatActive(seat: number) {
  return state.value?.currentSeat === seat && state.value.phase !== 'ended'
}

function initGame() {
  showEnd.value = false
  selected.value = new Set()
  const { state: deck, bottom } = deal()
  bottomCards.value = bottom
  state.value = deck
  processBots()
}

function handleReplay() {
  initGame()
}
onMounted(() => {
  if (!gameFlow.ensureSetup()) return
  initGame()
})

watch(
  () => [state.value?.phase, state.value?.currentSeat, isMyTurn.value] as const,
  () => refreshPlayHint(),
)

watch(
  () => state.value?.phase,
  (p) => {
    if (p === 'ended' && !showEnd.value) {
      const winner = players.value.find((_, i) => state.value!.hands[i]?.length === 0)
      endMessage.value = winner ? `${winner.name} 获胜` : '对局结束'
      showEnd.value = true
    }
  },
)
</script>

<template>
  <GameLayout
    title="斗地主"
    game-id="doudizhu"
    landscape
    @back="gameFlow.confirmExit"
    @setup="gameFlow.goSetup"
    @lobby="gameFlow.goLobby"
  >
    <div class="game-table ddz card-game-layout card-game-layout--landscape">
      <div class="card-game-layout__arena">
        <van-notice-bar :text="noticeText" />

        <div class="ddz-table">
          <PlayerBadge
            class="ddz-table__top"
            position="top"
            :name="players[topSeat]?.name ?? '玩家'"
            :card-count="state?.hands[topSeat]?.length"
            :is-landlord="state?.landlord === topSeat"
            :is-active="seatActive(topSeat)"
            :is-bot="players[topSeat]?.type === 'bot'"
          />

          <PlayerBadge
            class="ddz-table__left"
            position="left"
            :name="players[leftSeat]?.name ?? '玩家'"
            :card-count="state?.hands[leftSeat]?.length"
            :is-landlord="state?.landlord === leftSeat"
            :is-active="seatActive(leftSeat)"
            :is-bot="players[leftSeat]?.type === 'bot'"
          />

          <div class="ddz-table__center">
            <div v-if="state?.phase === 'bidding'" class="ddz-play-zone">
              <p class="ddz-play-zone__label">叫地主 · 手牌强度 {{ bidScore(myHand) }}</p>
            </div>

            <div v-else class="ddz-play-zone">
              <p v-if="!centerPlay?.cards?.length" class="ddz-play-zone__label">出牌区</p>
              <template v-else>
                <p class="ddz-play-zone__label">{{ players[centerPlay.seat]?.name }} 出牌</p>
                <PlayingCard
                  v-for="c in centerPlay.cards"
                  :key="c.id"
                  :label="cardLabel(c)"
                  :red="cardIsRed(c)"
                  :joker="c.suit === 'joker'"
                  small
                />
              </template>
            </div>

            <div
              v-if="state?.landlord !== null && bottomCards.length && state?.phase === 'playing'"
              class="ddz-play-zone ddz-play-zone--compact"
            >
              <p class="ddz-play-zone__label">底牌</p>
              <PlayingCard
                v-for="c in bottomCards"
                :key="'b-' + c.id"
                :label="cardLabel(c)"
                :red="cardIsRed(c)"
                :joker="c.suit === 'joker'"
                small
              />
            </div>
          </div>
        </div>
      </div>

      <PlayerHandDock
        v-if="state && state.phase !== 'ended'"
        theme="doudizhu"
        class="ddz-hand-dock"
        title="我的手牌"
        :count="myHand.length"
        :hint="playHint ?? undefined"
        :subtitle="state.landlord === mySeat ? '地主' : undefined"
        :active="handActive"
        :waiting="handWaiting"
      >
        <HandRow fit :count="myHand.length">
          <PlayingCard
            v-for="c in myHand"
            :key="c.id"
            :label="cardLabel(c)"
            :red="cardIsRed(c)"
            :joker="c.suit === 'joker'"
            hand
            :selected="selected.has(c.id)"
            :dimmed="state.phase === 'playing' && !isMyTurn"
            @click="toggleCard(c.id)"
          />
        </HandRow>
        <template v-if="ddzActions.length" #actions>
          <GameActionBar :actions="ddzActions" @action="onDdzAction" />
        </template>
      </PlayerHandDock>
    </div>

    <GameEndDialog
      :show="showEnd"
      game-name="斗地主"
      :message="endMessage"
      @replay="handleReplay"
      @setup="gameFlow.goSetup"
      @lobby="gameFlow.goLobby"
    />
  </GameLayout>
</template>

<style scoped>
.ddz {
  min-height: 0;
}
</style>
