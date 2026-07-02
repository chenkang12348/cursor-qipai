export type Suit = 'tong' | 'tiao' | 'wan'
export type Honor = 'dong' | 'nan' | 'xi' | 'bei' | 'zhong' | 'fa' | 'bai'

export interface MahjongRuleConfig {
  id: string
  name: string
  baseVariant: 'sichuan' | 'guangdong' | 'guobiao' | 'custom'
  tileSet: {
    suits: Suit[]
    includeHonors: boolean
    includeFlowers: boolean
  }
  actions: {
    chi: boolean
    peng: boolean
    gang: boolean
    qiangGang: boolean
  }
  winRules: {
    queMen: boolean
    minFan: number
    xueZhan: boolean
    lastFourMustHu: boolean
    yiPaoDuoXiang: boolean
  }
  scoring: {
    ziMoDouble: boolean
    gangShangHua: boolean
    dianGangHua: boolean
    chaJiao: boolean
    chaHuaZhu: boolean
  }
}

export interface Tile {
  id: string
  suit: Suit | Honor
  rank: number
}

export type GamePhase = 'queMen' | 'playing' | 'ended'

export interface MahjongState {
  wall: Tile[]
  hands: Tile[][]
  discards: Tile[][]
  currentSeat: number
  dealer: number
  phase: GamePhase
  queMen: (Suit | null)[]
  winners: number[]
  lastDiscard: { seat: number; tile: Tile } | null
  ruleConfig: MahjongRuleConfig
}

export interface MahjongAction {
  type: 'queMen' | 'discard' | 'peng' | 'gang' | 'hu' | 'pass'
  seat: number
  tile?: Tile
  suit?: Suit
}
