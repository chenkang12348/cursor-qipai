const SIZE = 15

export type Cell = 0 | 1 | 2 // 0 empty, 1 black, 2 white

export function createBoard(): Cell[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0) as Cell[])
}

export function checkWin(board: Cell[][], row: number, col: number, player: 1 | 2): boolean {
  const dirs = [
    [1, 0], [0, 1], [1, 1], [1, -1],
  ]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const sign of [1, -1]) {
      let r = row + dr! * sign
      let c = col + dc! * sign
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r]![c] === player) {
        count++
        r += dr! * sign
        c += dc! * sign
      }
    }
    if (count >= 5) return true
  }
  return false
}

const SCORE = [
  [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
  [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
]

function evaluatePoint(board: Cell[][], r: number, c: number, player: 1 | 2): number {
  let score = 0
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let count = 0
    let empty = 0
    for (const sign of [1, -1]) {
      let nr = r + dr! * sign
      let nc = c + dc! * sign
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (board[nr]![nc] === player) count++
        else if (board[nr]![nc] === 0) { empty++; break }
        else break
        nr += dr! * sign
        nc += dc! * sign
      }
    }
    if (count >= 4) score += 10000
    else if (count === 3 && empty) score += 1000
    else score += SCORE[count]?.[empty ? 1 : 0] ?? 0
  }
  return score
}

export function botMove(board: Cell[][], player: 1 | 2, difficulty: string): [number, number] {
  const candidates: [number, number][] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r]![c] === 0) candidates.push([r, c])
    }
  }
  if (difficulty === 'easy') {
    return candidates[Math.floor(Math.random() * candidates.length)]!
  }
  let best = candidates[0]!
  let bestScore = -Infinity
  for (const [r, c] of candidates) {
    board[r]![c] = player
    const s = evaluatePoint(board, r, c, player)
    board[r]![c] = 0
    if (s > bestScore) {
      bestScore = s
      best = [r, c]
    }
  }
  return best
}
