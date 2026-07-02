import type { BotPlayer, BotDifficulty } from '@/bots/BotPlayer'
import type { Board, Color } from '../engine'
import { botMove } from '../engine'

export interface ChessAction {
  from: [number, number]
  to: [number, number]
}

export function createChessBot(difficulty: BotDifficulty): BotPlayer<
  { board: Board; color: Color },
  ChessAction | null
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
