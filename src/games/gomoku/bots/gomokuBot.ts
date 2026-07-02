import type { BotPlayer, BotDifficulty } from '@/bots/BotPlayer'
import type { Cell } from '../engine'
import { botMove } from '../engine'
import { runInBotWorker } from '@/bots/workers/botWorkerClient'

export function createGomokuBot(difficulty: BotDifficulty): BotPlayer<
  { board: Cell[][]; player: 1 | 2 },
  [number, number]
> {
  return {
    difficulty,
    async decide(state) {
      if (difficulty === 'hard') {
        try {
          const boardCopy = state.board.map((row) => [...row])
          return await runInBotWorker<[number, number]>({
            game: 'gomoku',
            payload: { board: boardCopy, player: state.player, size: 15 },
          })
        } catch {
          return botMove(state.board, state.player, 'medium')
        }
      }
      return botMove(state.board, state.player, difficulty)
    },
  }
}
