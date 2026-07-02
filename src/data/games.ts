export interface GameMeta {
  id: string
  name: string
  icon: string
  color: string
  maxPlayers: number
  description: string
  tags: string[]
}

export const GAMES: GameMeta[] = [
  {
    id: 'mahjong',
    name: '麻将',
    icon: '🀄',
    color: '#1e6b45',
    maxPlayers: 4,
    description: '四川血战 / 国标 / 广东，支持自定义规则',
    tags: ['4人', 'AI补位'],
  },
  {
    id: 'doudizhu',
    name: '斗地主',
    icon: '🃏',
    color: '#1989fa',
    maxPlayers: 3,
    description: '经典三人斗地主，叫分抢地主',
    tags: ['3人', 'AI补位'],
  },
  {
    id: 'gomoku',
    name: '五子棋',
    icon: '⚫',
    color: '#323233',
    maxPlayers: 2,
    description: '15路棋盘，五子连珠',
    tags: ['2人', 'AI补位'],
  },
]

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}
