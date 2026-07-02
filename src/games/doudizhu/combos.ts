import type { Card } from './engine'
import { sortCards } from './engine'

export type ComboType =
  | 'single'
  | 'pair'
  | 'triple'
  | 'triple_single'
  | 'triple_pair'
  | 'straight'
  | 'pair_straight'
  | 'bomb'
  | 'rocket'

export interface Combo {
  type: ComboType
  rank: number
  length: number
  cards: Card[]
}

const COMBO_LABEL: Record<ComboType, string> = {
  single: '单张',
  pair: '对子',
  triple: '三张',
  triple_single: '三带一',
  triple_pair: '三带对',
  straight: '顺子',
  pair_straight: '连对',
  bomb: '炸弹',
  rocket: '王炸',
}

export function comboLabel(combo: Combo): string {
  return COMBO_LABEL[combo.type]
}

function groupByRank(cards: Card[]): Map<number, Card[]> {
  const m = new Map<number, Card[]>()
  for (const c of cards) {
    const arr = m.get(c.rank) ?? []
    arr.push(c)
    m.set(c.rank, arr)
  }
  return m
}

/** 解析牌型，非法返回 null */
export function parseCombo(cards: Card[]): Combo | null {
  if (!cards.length) return null
  const sorted = sortCards(cards)

  if (
    sorted.length === 2 &&
    sorted.every((c) => c.suit === 'joker') &&
    sorted[0]!.rank === 16 &&
    sorted[1]!.rank === 17
  ) {
    return { type: 'rocket', rank: 17, length: 2, cards: sorted }
  }

  const groups = groupByRank(sorted)
  const ranks = sorted.map((c) => c.rank)

  if (sorted.length === 4 && groups.size === 1) {
    return { type: 'bomb', rank: ranks[0]!, length: 4, cards: sorted }
  }

  if (sorted.length === 1) {
    return { type: 'single', rank: ranks[0]!, length: 1, cards: sorted }
  }

  if (sorted.length === 2 && groups.size === 1 && ranks[0]! <= 15) {
    return { type: 'pair', rank: ranks[0]!, length: 2, cards: sorted }
  }

  if (sorted.length === 3 && groups.size === 1) {
    return { type: 'triple', rank: ranks[0]!, length: 3, cards: sorted }
  }

  if (sorted.length === 4) {
    const counts = [...groups.values()].map((v) => v.length).sort((a, b) => a - b)
    if (counts.join(',') === '1,3') {
      const tripleRank = [...groups.entries()].find(([, v]) => v.length === 3)![0]
      return { type: 'triple_single', rank: tripleRank, length: 4, cards: sorted }
    }
  }

  if (sorted.length === 5) {
    const counts = [...groups.values()].map((v) => v.length).sort((a, b) => a - b)
    if (counts.join(',') === '2,3') {
      const tripleRank = [...groups.entries()].find(([, v]) => v.length === 3)![0]
      return { type: 'triple_pair', rank: tripleRank, length: 5, cards: sorted }
    }
  }

  if (sorted.length >= 5 && sorted.every((c) => c.rank <= 14)) {
    const unique = [...new Set(ranks)].sort((a, b) => a - b)
    if (unique.length === sorted.length) {
      let consecutive = true
      for (let i = 1; i < unique.length; i++) {
        if (unique[i]! - unique[i - 1]! !== 1) consecutive = false
      }
      if (consecutive) {
        return {
          type: 'straight',
          rank: unique[unique.length - 1]!,
          length: sorted.length,
          cards: sorted,
        }
      }
    }
  }

  if (sorted.length >= 6 && sorted.length % 2 === 0 && sorted.every((c) => c.rank <= 14)) {
    const pairRanks = [...groups.entries()]
      .filter(([, v]) => v.length === 2)
      .map(([r]) => r)
      .sort((a, b) => a - b)
    const pairCount = sorted.length / 2
    if (pairRanks.length === pairCount && pairCount >= 3) {
      let consecutive = true
      for (let i = 1; i < pairRanks.length; i++) {
        if (pairRanks[i]! - pairRanks[i - 1]! !== 1) consecutive = false
      }
      if (consecutive) {
        return {
          type: 'pair_straight',
          rank: pairRanks[pairRanks.length - 1]!,
          length: pairCount,
          cards: sorted,
        }
      }
    }
  }

  return null
}

export function canBeat(last: Combo, next: Combo): boolean {
  if (next.type === 'rocket') return true
  if (next.type === 'bomb') {
    if (last.type === 'rocket') return false
    if (last.type === 'bomb') return next.rank > last.rank
    return true
  }
  if (next.type !== last.type) return false
  if (next.type === 'straight' || next.type === 'pair_straight') {
    return next.length === last.length && next.rank > last.rank
  }
  return next.rank > last.rank
}

function pickOne(hand: Card[], rank: number, count: number): Card[] | null {
  const same = hand.filter((c) => c.rank === rank)
  return same.length >= count ? same.slice(0, count) : null
}

function findStraights(hand: Card[]): Card[][] {
  const result: Card[][] = []
  for (let len = 5; len <= 12; len++) {
    for (let start = 3; start <= 14 - len + 1; start++) {
      const combo: Card[] = []
      let ok = true
      for (let r = start; r < start + len; r++) {
        const card = hand.find((c) => c.rank === r && !combo.some((x) => x.id === c.id))
        if (!card) {
          ok = false
          break
        }
        combo.push(card)
      }
      if (ok) result.push(combo)
    }
  }
  return result
}

function findPairStraights(hand: Card[]): Card[][] {
  const result: Card[][] = []
  const byRank = groupByRank(hand)
  const pairRanks = [...byRank.entries()]
    .filter(([, v]) => v.length >= 2 && v[0]!.rank <= 14)
    .map(([r]) => r)
    .sort((a, b) => a - b)

  for (let len = 3; len <= pairRanks.length; len++) {
    for (let i = 0; i <= pairRanks.length - len; i++) {
      const seq = pairRanks.slice(i, i + len)
      let consecutive = true
      for (let j = 1; j < seq.length; j++) {
        if (seq[j]! - seq[j - 1]! !== 1) consecutive = false
      }
      if (!consecutive) continue
      const combo: Card[] = []
      for (const r of seq) {
        combo.push(...pickOne(hand, r, 2)!)
      }
      result.push(combo)
    }
  }
  return result
}

/** 从手牌枚举所有合法牌型组合 */
export function enumeratePlays(hand: Card[]): Card[][] {
  const plays: Card[][] = []
  const seen = new Set<string>()
  const add = (cards: Card[]) => {
    const key = sortCards(cards)
      .map((c) => c.id)
      .join(',')
    if (seen.has(key)) return
    if (parseCombo(cards)) {
      seen.add(key)
      plays.push(cards)
    }
  }

  for (const c of hand) add([c])

  const byRank = groupByRank(hand)
  for (const [rank, cards] of byRank) {
    if (cards.length >= 2 && rank <= 15) add(cards.slice(0, 2))
    if (cards.length >= 3) add(cards.slice(0, 3))
    if (cards.length >= 4) add(cards.slice(0, 4))
  }

  const jokers = hand.filter((c) => c.suit === 'joker')
  if (jokers.length === 2) add(jokers)

  for (const s of findStraights(hand)) add(s)
  for (const ps of findPairStraights(hand)) add(ps)

  for (const [rank, triple] of byRank) {
    if (triple.length < 3) continue
    const t = triple.slice(0, 3)
    for (const c of hand) {
      if (c.rank !== rank) add([...t, c])
    }
    for (const [r2, pair] of byRank) {
      if (r2 === rank || pair.length < 2) continue
      add([...t, ...pair.slice(0, 2)])
    }
  }

  return plays
}

export function legalPlays(hand: Card[], lastCards: Card[]): Card[][] {
  const all = enumeratePlays(hand)
  if (!lastCards.length) return all
  const last = parseCombo(lastCards)
  if (!last) return all
  return all.filter((cards) => {
    const next = parseCombo(cards)
    return next && canBeat(last, next)
  })
}
