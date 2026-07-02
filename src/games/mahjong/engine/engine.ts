import type { MahjongAction, MahjongRuleConfig, MahjongState, Suit, Tile } from '../types/ruleConfig'
import { canWin, createWall, sortHand } from './tiles'

export function createGame(rule: MahjongRuleConfig, playerCount = 4): MahjongState {
  const wall = createWall(rule)
  const hands: Tile[][] = Array.from({ length: playerCount }, () => [])
  for (let r = 0; r < 13; r++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p]!.push(wall.pop()!)
    }
  }
  hands[0]!.push(wall.pop()!)
  return {
    wall,
    hands: hands.map(sortHand),
    discards: Array.from({ length: playerCount }, () => []),
    currentSeat: 0,
    dealer: 0,
    phase: rule.winRules.queMen ? 'queMen' : 'playing',
    queMen: Array(playerCount).fill(null),
    winners: [],
    lastDiscard: null,
    ruleConfig: rule,
  }
}

export function setQueMen(state: MahjongState, seat: number, suit: Suit): MahjongState {
  const queMen = [...state.queMen]
  queMen[seat] = suit
  const allSet = queMen.every((q) => q !== null)
  return { ...state, queMen, phase: allSet ? 'playing' : 'queMen' }
}

export function drawTile(state: MahjongState, seat: number): MahjongState {
  if (state.wall.length === 0) return { ...state, phase: 'ended' }
  const tile = state.wall.pop()!
  const hands = state.hands.map((h, i) => (i === seat ? sortHand([...h, tile]) : h))
  return { ...state, hands }
}

export function discardTile(state: MahjongState, seat: number, tile: Tile): MahjongState {
  const hand = state.hands[seat]!.filter((t) => t.id !== tile.id)
  const discards = state.discards.map((d, i) => (i === seat ? [...d, tile] : d))
  let next = (seat + 1) % state.hands.length
  while (state.winners.includes(next)) next = (next + 1) % state.hands.length
  return {
    ...state,
    hands: state.hands.map((h, i) => (i === seat ? hand : h)),
    discards,
    currentSeat: next,
    lastDiscard: { seat, tile },
  }
}

export function applyAction(state: MahjongState, action: MahjongAction): MahjongState {
  switch (action.type) {
    case 'queMen':
      return action.suit ? setQueMen(state, action.seat, action.suit) : state
    case 'discard':
      if (!action.tile) return state
      return discardTile(state, action.seat, action.tile)
    case 'hu': {
      const winners = [...state.winners, action.seat]
      const xueZhan = state.ruleConfig.winRules.xueZhan
      if (!xueZhan || winners.length >= state.hands.length - 1) {
        return { ...state, winners, phase: 'ended' }
      }
      return { ...state, winners }
    }
    default:
      return state
  }
}

export function legalDiscards(state: MahjongState, seat: number): Tile[] {
  const hand = state.hands[seat] ?? []
  const que = state.queMen[seat]
  if (que && state.ruleConfig.winRules.queMen) {
    const must = hand.filter((t) => t.suit === que)
    if (must.length > 0) return must
  }
  return hand
}

export function canHu(state: MahjongState, seat: number): boolean {
  const hand = state.hands[seat] ?? []
  if (!canWin(hand)) return false
  const que = state.queMen[seat]
  if (que && hand.some((t) => t.suit === que)) return false
  return true
}

export function findDiscardForBot(state: MahjongState, seat: number, difficulty: string): Tile {
  const options = legalDiscards(state, seat)
  if (options.length === 0) return state.hands[seat]![0]!
  if (difficulty === 'easy') {
    return options[Math.floor(Math.random() * options.length)]!
  }
  const counts = new Map<string, number>()
  for (const t of options) {
    const k = `${t.suit}-${t.rank}`
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  if (difficulty === 'medium') {
    return options.sort((a, b) => {
      const ca = counts.get(`${a.suit}-${a.rank}`) ?? 0
      const cb = counts.get(`${b.suit}-${b.rank}`) ?? 0
      return ca - cb
    })[0]!
  }
  return options[0]!
}

export function chooseQueMen(hand: Tile[]): Suit {
  const suits: Suit[] = ['wan', 'tiao', 'tong']
  const counts = { wan: 0, tiao: 0, tong: 0 }
  for (const t of hand) {
    if (t.suit in counts) counts[t.suit as Suit]++
  }
  return suits.sort((a, b) => counts[a] - counts[b])[0]!
}

export { isSameTile, tileLabel, sortHand } from './tiles'
