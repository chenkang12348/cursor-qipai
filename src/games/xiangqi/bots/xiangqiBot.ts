import type { BotPlayer, BotDifficulty } from '@/bots/BotPlayer'
import type { Board, Color } from '../engine'
import { botMove } from '../engine'

export interface XiangqiAction {
  from: [number, number]
  to: [number, number]
}

export function createXiangqiBot(difficulty: BotDifficulty): BotPlayer<
  { board: Board; color: Color },
  XiangqiAction | null
> {
  return {
    difficulty,
    async decide(state) {
      const move = botMove(state.board, state.color, difficulty)
      if (!move) return null
      return { from: [move[0], move[1]], to: [move[2], move[3]] }
    },
  }
}
