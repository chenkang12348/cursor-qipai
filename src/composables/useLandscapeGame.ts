import { onMounted, onUnmounted } from 'vue'
import { useBreakpoint } from './useBreakpoint'

/** 麻将 / 斗地主移动端：尝试锁定横屏（失败则静默降级，不旋转 DOM） */
export function useLandscapeGame(enabled: () => boolean) {
  const { isMobile } = useBreakpoint()

  async function lockLandscape() {
    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (mode: string) => Promise<void>
      }
      if (orientation?.lock) {
        await orientation.lock('landscape-primary')
      }
    } catch {
      /* iOS / 桌面浏览器不支持，保持当前方向正常游玩 */
    }
  }

  function unlockOrientation() {
    try {
      screen.orientation?.unlock?.()
    } catch {
      /* ignore */
    }
  }

  onMounted(() => {
    if (!enabled() || !isMobile.value) return
    void lockLandscape()
  })

  onUnmounted(() => {
    unlockOrientation()
  })
}
