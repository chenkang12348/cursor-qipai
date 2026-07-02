import type { WorkerTask, WorkerResult } from './botWorkerClient'

/** Worker 内禁止 fetch / 外部 API */
self.onmessage = (e: MessageEvent<WorkerTask>) => {
  const { game, payload } = e.data
  let result: unknown = null

  if (game === 'gomoku') {
    result = gomokuHard(payload as GomokuPayload)
  }

  self.postMessage({ result } satisfies WorkerResult)
}

interface GomokuPayload {
  board: number[][]
  player: number
  size: number
}

function gomokuHard(payload: GomokuPayload): [number, number] {
  const { board, player, size } = payload
  const opp = player === 1 ? 2 : 1
  let best: [number, number] = [-1, -1]
  let bestScore = -Infinity

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]![c] !== 0) continue
      board[r]![c] = player
      const attack = lineScore(board, r, c, player, size)
      board[r]![c] = opp
      const defend = lineScore(board, r, c, opp, size)
      board[r]![c] = 0
      const score = attack * 1.1 + defend
      if (score > bestScore) {
        bestScore = score
        best = [r, c]
      }
    }
  }
  return best[0] >= 0 ? best : [0, 0]
}

function lineScore(board: number[][], r: number, c: number, p: number, size: number): number {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]]
  let total = 0
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const sign of [1, -1]) {
      let nr = r + dr! * sign
      let nc = c + dc! * sign
      while (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr]![nc] === p) {
        count++
        nr += dr! * sign
        nc += dc! * sign
      }
    }
    if (count >= 5) total += 100000
    else if (count === 4) total += 10000
    else if (count === 3) total += 1000
    else if (count === 2) total += 100
  }
  return total
}
