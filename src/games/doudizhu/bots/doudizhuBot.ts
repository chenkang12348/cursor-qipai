import type { BotPlayer, BotDifficulty } from '@/bots/BotPlayer'
import type { Card, DoudizhuState } from '../engine'
import { botBid, botPlay, legalPlay, sortCards } from '../engine'

export interface DoudizhuAction {
  type: 'bid' | 'play' | 'pass'
  bid?: number
  cards?: Card[]
}

export function createDoudizhuBot(difficulty: BotDifficulty): BotPlayer<DoudizhuState, DoudizhuAction> {
  return {
    difficulty,
    async decide(state, seat) {
      if (state.phase === 'bidding') {
        return { type: 'bid', bid: botBid(state.hands[seat]!, difficulty) }
      }
      const hand = state.hands[seat]!
      const last = state.lastPlay
      const playable = legalPlay(hand, last?.cards ?? [])
      if (playable.length === 0) {
        return { type: 'pass' }
      }
      if (difficulty === 'hard') {
        const sorted = sortCards(hand)
        const pick = playable.find((p) => p.length === 1) ?? playable[0]
        return { type: 'play', cards: pick ?? [sorted[0]!] }
      }
      const cards = botPlay(hand, difficulty)
      return { type: 'play', cards }
    },
  }
}
