import type { Cell } from './engine'
import { botMove } from './engine'

export function suggestMove(board: Cell[][], player: 1 | 2): [number, number] {
  return botMove(board, player, 'hard')
}

export function describeGomokuHint(board: Cell[][], player: 1 | 2): string {
  const [r, c] = suggestMove(board, player)
  return `建议落子：第 ${r + 1} 行 · 第 ${c + 1} 列`
}
