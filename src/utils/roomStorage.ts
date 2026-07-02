const ROOM_PREFIX = 'dt:room:'

function getRoomIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('room')
}

function channelName(roomId: string): string {
  return `dt-room-${roomId}`
}

export class RoomStorage<T> {
  private roomId: string
  private bc: BroadcastChannel | null = null

  constructor(roomId?: string) {
    this.roomId = roomId ?? getRoomIdFromUrl() ?? ''
    if (this.roomId && typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(channelName(this.roomId))
    }
  }

  get id(): string {
    return this.roomId
  }

  static createRoom<T>(gameId: string, initial?: T): string {
    const roomId = `${gameId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const key = ROOM_PREFIX + roomId
    if (initial !== undefined) {
      localStorage.setItem(key, JSON.stringify(initial))
    }
    return roomId
  }

  static joinRoom(roomId: string): RoomStorage<unknown> {
    return new RoomStorage(roomId)
  }

  private key(): string {
    return ROOM_PREFIX + this.roomId
  }

  getState(): T | null {
    if (!this.roomId) return null
    const raw = localStorage.getItem(this.key())
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  setState(state: T): void {
    if (!this.roomId) return
    localStorage.setItem(this.key(), JSON.stringify(state))
    this.bc?.postMessage({ type: 'state', state })
  }

  onStateChange(cb: (state: T) => void): () => void {
    const onStorage = (e: StorageEvent) => {
      if (e.key === this.key() && e.newValue) {
        try {
          cb(JSON.parse(e.newValue) as T)
        } catch {
          /* ignore */
        }
      }
    }
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'state') cb(e.data.state as T)
    }
    window.addEventListener('storage', onStorage)
    this.bc?.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('storage', onStorage)
      this.bc?.removeEventListener('message', onMessage)
    }
  }
}

export function setRoomInUrl(roomId: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set('room', roomId)
  window.history.replaceState({}, '', url.toString())
}
