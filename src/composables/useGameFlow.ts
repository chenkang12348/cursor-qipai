import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useRoomStore } from '@/stores/room'
import { clearSessionCache } from '@/utils/appCache'

const PLAY_ROUTE: Record<string, string> = {
  mahjong: 'mahjong-play',
  doudizhu: 'doudizhu-play',
  gomoku: 'gomoku-play',
}

/** 对局进入 / 退出 / 重开统一流程 */
export function useGameFlow(gameId: string) {
  const router = useRouter()
  const roomStore = useRoomStore()

  function ensureSetup(): boolean {
    if (!roomStore.setup || roomStore.setup.gameId !== gameId) {
      router.replace({ name: 'setup', params: { gameId } })
      return false
    }
    return true
  }

  function goSetup() {
    router.push({ name: 'setup', params: { gameId } })
  }

  function goLobby() {
    roomStore.clearSetup()
    clearSessionCache()
    router.replace({ name: 'home' })
  }

  async function confirmExit(): Promise<boolean> {
    try {
      await showConfirmDialog({
        title: '退出对局',
        message: '确定要离开当前对局吗？进度将不会保存。',
        confirmButtonText: '退出',
        cancelButtonText: '继续玩',
      })
      goLobby()
      return true
    } catch {
      return false
    }
  }

  function replay() {
    if (gameId === 'mahjong') {
      router.replace({ name: 'mahjong-rules' })
      return
    }
    const name = PLAY_ROUTE[gameId]
    if (name) router.replace({ name })
  }

  return { ensureSetup, goSetup, goLobby, confirmExit, replay }
}
