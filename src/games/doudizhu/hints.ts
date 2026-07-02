import type { Card } from './engine'
import { cardLabel, sortCards } from './engine'
import { comboLabel, legalPlays, parseCombo } from './combos'

/** 推荐出牌：优先最小可压牌，首出则出最小单张 */
export function suggestPlay(hand: Card[], lastCards: Card[]): Card[] | null {
  const plays = legalPlays(hand, lastCards)
  if (!plays.length) return null

  plays.sort((a, b) => {
    const ca = parseCombo(a)!
    const cb = parseCombo(b)!
    if (ca.rank !== cb.rank) return ca.rank - cb.rank
    return ca.length - cb.length
  })

  if (!lastCards.length) {
    const singles = plays.filter((p) => p.length === 1)
    if (singles.length) return singles[0]!
  }

  return plays[0]!
}

export function describePlayHint(hand: Card[], lastCards: Card[]): string | null {
  const pick = suggestPlay(hand, lastCards)
  if (!pick) return lastCards.length ? '建议：不出（要不起）' : '暂无可用牌型'
  const combo = parseCombo(pick)!
  const labels = sortCards(pick).map(cardLabel).join(' ')
  return `建议出${comboLabel(combo)}：${labels}`
}
