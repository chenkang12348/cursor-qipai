import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameSetupConfig } from '@/types/player'
import { createPlayerSlots } from '@/types/player'
import type { BotDifficulty } from '@/bots/BotPlayer'

export const useRoomStore = defineStore('room', () => {
  const setup = ref<GameSetupConfig | null>(null)

  function saveSetup(
    gameId: string,
    humanCount: number,
    maxPlayers: number,
    autoFillBots: boolean,
    botDifficulty: BotDifficulty,
  ) {
    setup.value = {
      gameId,
      humanCount,
      maxPlayers,
      autoFillBots,
      botDifficulty,
      players: createPlayerSlots(humanCount, maxPlayers, autoFillBots, botDifficulty),
    }
  }

  function clearSetup() {
    setup.value = null
  }

  return { setup, saveSetup, clearSetup }
})
