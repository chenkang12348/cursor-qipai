import type { MahjongRuleConfig, Suit, Tile } from '../types/ruleConfig'

const SUIT_LABEL: Record<Suit, string> = { tong: '筒', tiao: '条', wan: '万' }
const HONOR_LABEL = ['东', '南', '西', '北', '中', '发', '白']

export function createWall(config: MahjongRuleConfig): Tile[] {
  const tiles: Tile[] = []
  let id = 0
  for (const suit of config.tileSet.suits) {
    for (let rank = 1; rank <= 9; rank++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({ id: `t${id++}`, suit, rank })
      }
    }
  }
  if (config.tileSet.includeHonors) {
    const honors = ['dong', 'nan', 'xi', 'bei', 'zhong', 'fa', 'bai'] as const
    honors.forEach((h, hi) => {
      for (let c = 0; c < 4; c++) {
        tiles.push({ id: `t${id++}`, suit: h, rank: hi + 1 })
      }
    })
  }
  return shuffle(tiles)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function tileLabel(tile: Tile): string {
  if (tile.suit === 'tong' || tile.suit === 'tiao' || tile.suit === 'wan') {
    return `${tile.rank}${SUIT_LABEL[tile.suit]}`
  }
  return HONOR_LABEL[tile.rank - 1] ?? '?'
}

export function isSameTile(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.rank === b.rank
}

export function sortHand(hand: Tile[]): Tile[] {
  const order = { wan: 0, tiao: 1, tong: 2 }
  return [...hand].sort((a, b) => {
    const sa = order[a.suit as Suit] ?? 10 + a.rank
    const sb = order[b.suit as Suit] ?? 10 + b.rank
    if (sa !== sb) return sa - sb
    return a.rank - b.rank
  })
}

export function canWin(hand: Tile[]): boolean {
  if ((hand.length - 2) % 3 !== 0) return false
  const counts = new Map<string, number>()
  for (const t of hand) {
    const k = `${t.suit}-${t.rank}`
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return tryWin(Array.from(counts.entries()).map(([k, c]) => ({ key: k, count: c })))
}

function tryWin(tiles: { key: string; count: number }[]): boolean {
  if (tiles.every((t) => t.count === 0)) return true
  tiles.sort((a, b) => a.key.localeCompare(b.key))

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i]!.count >= 2) {
      const copy = tiles.map((t) => ({ ...t, count: t.count }))
      copy[i]!.count -= 2
      if (removeSets(copy)) return true
    }
  }
  return false
}

function removeSets(tiles: { key: string; count: number }[]): boolean {
  const idx = tiles.findIndex((t) => t.count > 0)
  if (idx < 0) return true
  const t = tiles[idx]!
  const parts = t.key.split('-')
  const suit = parts[0]
  const rank = Number(parts[1])

  if (t.count >= 3) {
    const copy = tiles.map((x) => ({ ...x, count: x.count }))
    copy[idx]!.count -= 3
    if (removeSets(copy)) return true
  }

  if (suit === 'wan' || suit === 'tiao' || suit === 'tong') {
    if (rank <= 7) {
      const k2 = `${suit}-${rank + 1}`
      const k3 = `${suit}-${rank + 2}`
      const i2 = tiles.findIndex((x) => x.key === k2)
      const i3 = tiles.findIndex((x) => x.key === k3)
      if (i2 >= 0 && i3 >= 0 && tiles[i2]!.count > 0 && tiles[i3]!.count > 0) {
        const copy = tiles.map((x) => ({ ...x, count: x.count }))
        copy[idx]!.count--
        copy[i2]!.count--
        copy[i3]!.count--
        if (removeSets(copy)) return true
      }
    }
  }
  return false
}
