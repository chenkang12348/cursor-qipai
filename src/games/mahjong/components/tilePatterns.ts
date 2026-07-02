import type { Tile } from '@/games/mahjong/types/ruleConfig'

/** 筒子牌圆点布局（3×3 网格坐标） */
const PIN_LAYOUTS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
  7: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]],
  8: [[0, 0], [0, 1], [0, 2], [0, 3], [2, 0], [2, 1], [2, 2], [2, 3]],
  9: [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ],
}

const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

const HONOR_CHAR: Record<string, string> = {
  dong: '东',
  nan: '南',
  xi: '西',
  bei: '北',
  zhong: '中',
  fa: '发',
  bai: '白',
}

export function pinDots(rank: number): [number, number][] {
  return PIN_LAYOUTS[rank] ?? []
}

export function wanNumeral(rank: number): string {
  return CN_NUM[rank] ?? String(rank)
}

export function honorChar(suit: string): string {
  return HONOR_CHAR[suit] ?? '?'
}

export function isSuitNumber(suit: string): suit is 'wan' | 'tiao' | 'tong' {
  return suit === 'wan' || suit === 'tiao' || suit === 'tong'
}

/** 条子：竖条数量（1 条用特殊标记） */
export function souStickCount(rank: number): number {
  return Math.min(9, Math.max(1, rank))
}

export function tileAriaLabel(tile: Tile): string {
  if (isSuitNumber(tile.suit)) {
    const suitName = { wan: '万', tiao: '条', tong: '筒' }[tile.suit]
    return `${tile.rank}${suitName}`
  }
  return honorChar(tile.suit)
}
