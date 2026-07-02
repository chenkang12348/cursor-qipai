import type { BotPlayer } from '@/bots/BotPlayer'
import { randomPick } from '@/bots/BotPlayer'
import type { MahjongAction, MahjongState } from '../types/ruleConfig'
import { canHu, chooseQueMen, findDiscardForBot, legalDiscards } from '../engine/engine'

export function createMahjongBot(difficulty: 'easy' | 'medium' | 'hard'): BotPlayer<
  MahjongState,
  MahjongAction
> {
  return {
    difficulty,
    async decide(state, seat) {
      if (state.phase === 'queMen') {
        return { type: 'queMen', seat, suit: chooseQueMen(state.hands[seat] ?? []) }
      }
      if (canHu(state, seat)) {
        return { type: 'hu', seat }
      }
      const options = legalDiscards(state, seat)
      const tile = findDiscardForBot(state, seat, difficulty)
      if (options.length === 0) {
        return { type: 'pass', seat }
      }
      if (difficulty === 'easy' && Math.random() < 0.1) {
        return { type: 'pass', seat }
      }
      return { type: 'discard', seat, tile: tile ?? randomPick(options) }
    },
  }
}
