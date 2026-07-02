// 斗地主牌型与引擎
import { canBeat, legalPlays, parseCombo } from './combos'
export type Suit = 'spade' | 'heart' | 'club' | 'diamond' | 'joker'
export type Rank =
  | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17

export interface Card {
  id: string
  suit: Suit
  rank: Rank
}

export type Phase = 'bidding' | 'playing' | 'ended'

export interface DoudizhuState {
  hands: Card[][]
  landlord: number | null
  currentSeat: number
  phase: Phase
  lastPlay: { seat: number; cards: Card[] } | null
  bids: (number | null)[]
  multiplier: number
  passCount: number
}

const RANK_LABEL: Record<number, string> = {
  3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2', 16: '小王', 17: '大王',
}

export function cardLabel(c: Card): string {
  if (c.suit === 'joker') return RANK_LABEL[c.rank] ?? '?'
  const suits = { spade: '♠', heart: '♥', club: '♣', diamond: '♦' }
  return `${suits[c.suit]}${RANK_LABEL[c.rank]}`
}

export function cardIsRed(c: Card): boolean {
  if (c.suit === 'joker') return c.rank === 17
  return c.suit === 'heart' || c.suit === 'diamond'
}

export function createDeck(): Card[] {
  const cards: Card[] = []
  let id = 0
  const suits: Suit[] = ['spade', 'heart', 'club', 'diamond']
  for (const suit of suits) {
    for (let rank = 3; rank <= 15; rank++) {
      cards.push({ id: `c${id++}`, suit, rank: rank as Rank })
    }
  }
  cards.push({ id: `c${id++}`, suit: 'joker', rank: 16 })
  cards.push({ id: `c${id}`, suit: 'joker', rank: 17 })
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j]!, cards[i]!]
  }
  return cards
}

export function deal(): { state: DoudizhuState; bottom: Card[] } {
  const deck = createDeck()
  const hands = [deck.slice(0, 17), deck.slice(17, 34), deck.slice(34, 51)]
  const bottom = deck.slice(51)
  return {
    state: {
      hands,
      landlord: null,
      currentSeat: 0,
      phase: 'bidding',
      lastPlay: null,
      bids: [null, null, null],
      multiplier: 1,
      passCount: 0,
    },
    bottom,
  }
}

export function setLandlord(state: DoudizhuState, seat: number, bottom: Card[]): DoudizhuState {
  const hands = state.hands.map((h, i) => (i === seat ? [...h, ...bottom] : h))
  hands[seat] = sortCards(hands[seat]!)
  return { ...state, hands, landlord: seat, phase: 'playing', currentSeat: seat, passCount: 0 }
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => a.rank - b.rank)
}

export function bidScore(hand: Card[]): number {
  let s = 0
  for (const c of hand) {
    if (c.rank >= 16) s += 4
    else if (c.rank === 15) s += 2
    else if (c.rank === 14) s += 1
  }
  return s
}

export function playCards(state: DoudizhuState, seat: number, cards: Card[]): DoudizhuState {
  if (cards.length === 0) {
    const next = (seat + 1) % 3
    const passCount = state.passCount + 1
    if (state.lastPlay && passCount >= 2) {
      return {
        ...state,
        currentSeat: state.lastPlay.seat,
        lastPlay: null,
        passCount: 0,
      }
    }
    return { ...state, currentSeat: next, passCount }
  }

  const ids = new Set(cards.map((c) => c.id))
  const hands = state.hands.map((h, i) =>
    i === seat ? sortCards(h.filter((c) => !ids.has(c.id))) : h,
  )
  const next = (seat + 1) % 3
  const win = hands[seat]!.length === 0
  return {
    ...state,
    hands,
    lastPlay: { seat, cards: sortCards(cards) },
    currentSeat: next,
    phase: win ? 'ended' : 'playing',
    passCount: 0,
  }
}

export function botBid(hand: Card[], difficulty: string): number {
  const score = bidScore(hand)
  if (difficulty === 'easy') return score >= 5 ? 1 : 0
  if (difficulty === 'medium') return score >= 4 ? 2 : score >= 2 ? 1 : 0
  return score >= 3 ? 3 : score >= 1 ? 1 : 0
}

export function botPlay(hand: Card[], difficulty: string): Card[] {
  if (hand.length === 0) return []
  if (difficulty === 'easy') {
    return [hand[Math.floor(Math.random() * hand.length)]!]
  }
  return [hand[0]!]
}

/** 合法出牌 */
export function legalPlay(hand: Card[], lastCards: Card[]): Card[][] {
  return legalPlays(hand, lastCards)
}

export function validatePlay(hand: Card[], cards: Card[], lastCards: Card[]): string | null {
  if (!cards.length) return null
  for (const c of cards) {
    if (!hand.some((h) => h.id === c.id)) return '手牌中没有所选牌'
  }
  const combo = parseCombo(cards)
  if (!combo) return '无效牌型'
  if (lastCards.length) {
    const last = parseCombo(lastCards)
    if (!last || !canBeat(last, combo)) return '压不过上家'
  }
  return null
}
