export type PlayerType = 'human' | 'bot'
export type BotDifficulty = 'easy' | 'medium' | 'hard'

export interface PlayerSlot {
  id: string
  seat: number
  type: PlayerType
  name: string
  botDifficulty?: BotDifficulty
  isLocalHuman: boolean
}

export interface GameSetupConfig {
  gameId: string
  humanCount: number
  maxPlayers: number
  autoFillBots: boolean
  botDifficulty: BotDifficulty
  players: PlayerSlot[]
}

export const SEAT_NAMES = ['东', '南', '西', '北'] as const
export const SEAT_NAMES_3 = ['自己', '左家', '右家'] as const

export function createPlayerSlots(
  humanCount: number,
  maxPlayers: number,
  autoFillBots: boolean,
  botDifficulty: BotDifficulty,
): PlayerSlot[] {
  const slots: PlayerSlot[] = []
  for (let seat = 0; seat < maxPlayers; seat++) {
    const isHuman = seat < humanCount
    slots.push({
      id: `seat-${seat}`,
      seat,
      type: isHuman ? 'human' : autoFillBots ? 'bot' : 'human',
      name: isHuman
        ? seat === 0
          ? '你'
          : `玩家${seat + 1}`
        : autoFillBots
          ? `机器人-${String.fromCharCode(65 + seat - humanCount)}`
          : `等待加入`,
      botDifficulty: !isHuman && autoFillBots ? botDifficulty : undefined,
      isLocalHuman: isHuman,
    })
  }
  return slots
}
