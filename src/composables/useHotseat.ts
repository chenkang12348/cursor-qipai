import { ref, computed } from 'vue'
import type { PlayerSlot } from '@/types/player'

/** 热座模式：同设备多位真人轮流操作 */
export function useHotseat(players: () => PlayerSlot[]) {
  const activeSeat = ref(0)

  const humanSeats = computed(() =>
    players()
      .map((p, i) => ({ ...p, index: i }))
      .filter((p) => p.type === 'human'),
  )

  const isHumanTurn = (seat: number) => {
    const p = players()[seat]
    return p?.type === 'human'
  }

  const canOperate = (seat: number) => {
    if (!isHumanTurn(seat)) return false
    if (humanSeats.value.length <= 1) return true
    return activeSeat.value === seat
  }

  function advanceAfterHumanAction(seat: number) {
    if (humanSeats.value.length <= 1) return
    const idx = humanSeats.value.findIndex((h) => h.index === seat)
    const next = humanSeats.value[(idx + 1) % humanSeats.value.length]
    if (next) activeSeat.value = next.index
  }

  const passDeviceHint = computed(() => {
    const target = players()[activeSeat.value]
    if (!target || humanSeats.value.length <= 1) return ''
    return `请将设备交给 ${target.name}`
  })

  return {
    activeSeat,
    humanSeats,
    canOperate,
    advanceAfterHumanAction,
    passDeviceHint,
  }
}
