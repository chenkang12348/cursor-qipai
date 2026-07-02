import type { MahjongState } from './types/ruleConfig'
import type { Tile } from './types/ruleConfig'
import { canHu, findDiscardForBot, legalDiscards } from './engine/engine'
import { tileLabel } from './engine/tiles'

export function suggestDiscard(state: MahjongState, seat: number): Tile | null {
  const options = legalDiscards(state, seat)
  if (!options.length) return null
  return findDiscardForBot(state, seat, 'hard')
}

export function describeMahjongHint(state: MahjongState, seat: number): string | null {
  if (canHu(state, seat)) return '可以胡牌！点击「胡」或继续出牌'
  const tile = suggestDiscard(state, seat)
  if (!tile) return null
  const que = state.queMen[seat]
  if (que && tile.suit === que) {
    return `建议打出定缺牌：${tileLabel(tile)}（须先打完缺门）`
  }
  return `建议打出：${tileLabel(tile)}`
}
