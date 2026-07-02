/** 应用本地存储前缀 */
export const STORAGE = {
  app: 'dt:',
  room: 'dt:room:',
  mahjong: 'mahjong:',
} as const

/** 关闭页面时清理：房间状态、会话数据（保留主题/难度等偏好） */
export function clearSessionCache(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE.room)) {
        localStorage.removeItem(key)
      }
    }
    sessionStorage.clear()
  } catch {
    /* 隐私模式等场景可能不可用 */
  }
}

/** 手动清除全部本地缓存（含设置与麻将自定义规则） */
export function clearAllLocalCache(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE.app) || key.startsWith('mahjong:')) {
        localStorage.removeItem(key)
      }
    }
    sessionStorage.clear()
  } catch {
    /* ignore */
  }
}

/** 注册：关闭标签页 / 刷新时自动清理会话缓存 */
export function registerAutoClearOnClose(): void {
  if (typeof window === 'undefined') return

  const run = () => clearSessionCache()

  window.addEventListener('pagehide', (e) => {
    // persisted=true 表示进入 bfcache，不清理以便返回时恢复
    if (!e.persisted) run()
  })

  window.addEventListener('beforeunload', run)
}
