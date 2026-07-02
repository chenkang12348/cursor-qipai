import { defineStore } from 'pinia'
import { useDark, useLocalStorage } from '@vueuse/core'
import type { BotDifficulty } from '@/bots/BotPlayer'
import { clearAllLocalCache } from '@/utils/appCache'

export const useSettingsStore = defineStore('settings', () => {
  const isDark = useDark({ selector: 'html', attribute: 'class', valueDark: 'dark' })
  const defaultBotDifficulty = useLocalStorage<BotDifficulty>('dt:botDifficulty', 'hard')
  const soundEnabled = useLocalStorage('dt:sound', true)

  function clearCache() {
    clearAllLocalCache()
    defaultBotDifficulty.value = 'hard'
    soundEnabled.value = true
  }

  return { isDark, defaultBotDifficulty, soundEnabled, clearCache }
})
