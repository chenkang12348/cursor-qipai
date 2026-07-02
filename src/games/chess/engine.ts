// 国际象棋引擎（简化规则，无王车易位/吃过路兵）
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
export type Color = 'white' | 'black'

export interface Piece {
  type: PieceType
  color: Color
}

export type Board = (Piece | null)[][]

const UNICODE: Record<Color, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
}

export function pieceSymbol(p: Piece): string {
  return UNICODE[p.color][p.type]
}

export function initialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null))
  const back: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  back.forEach((type, x) => {
    b[0]![x] = { type, color: 'black' }
    b[7]![x] = { type, color: 'white' }
  })
  for (let x = 0; x < 8; x++) {
    b[1]![x] = { type: 'pawn', color: 'black' }
    b[6]![x] = { type: 'pawn', color: 'white' }
  }
  return b
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < 8 && y >= 0 && y < 8
}

export function getMoves(board: Board, x: number, y: number): [number, number][] {
  const piece = board[y]![x]
  if (!piece) return []
  const moves: [number, number][] = []
  const add = (nx: number, ny: number) => {
    if (!inBounds(nx, ny)) return
    const target = board[ny]![nx]
    if (!target || target.color !== piece.color) moves.push([nx, ny])
  }

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1
      const startRow = piece.color === 'white' ? 6 : 1
      const ny = y + dir
      if (inBounds(x, ny) && !board[ny]![x]) {
        moves.push([x, ny])
        if (y === startRow && !board[y + dir * 2]![x]) moves.push([x, y + dir * 2])
      }
      for (const dx of [-1, 1]) {
        const nx = x + dx
        if (inBounds(nx, ny)) {
          const t = board[ny]![nx]
          if (t && t.color !== piece.color) moves.push([nx, ny])
        }
      }
      break
    }
    case 'rook':
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let nx = x + dx!
        let ny = y + dy!
        while (inBounds(nx, ny)) {
          const t = board[ny]![nx]
          if (!t) moves.push([nx, ny])
          else {
            if (t.color !== piece.color) moves.push([nx, ny])
            break
          }
          nx += dx!
          ny += dy!
        }
      }
      break
    case 'bishop':
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        let nx = x + dx!
        let ny = y + dy!
        while (inBounds(nx, ny)) {
          const t = board[ny]![nx]
          if (!t) moves.push([nx, ny])
          else {
            if (t.color !== piece.color) moves.push([nx, ny])
            break
          }
          nx += dx!
          ny += dy!
        }
      }
      break
    case 'queen':
      for (const [dx, dy] of [
        [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        let nx = x + dx!
        let ny = y + dy!
        while (inBounds(nx, ny)) {
          const t = board[ny]![nx]
          if (!t) moves.push([nx, ny])
          else {
            if (t.color !== piece.color) moves.push([nx, ny])
            break
          }
          nx += dx!
          ny += dy!
        }
      }
      break
    case 'king':
      for (const [dx, dy] of [
        [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        add(x + dx!, y + dy!)
      }
      break
    case 'knight':
      for (const [dx, dy] of [
        [1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1],
      ]) {
        add(x + dx!, y + dy!)
      }
      break
  }
  return moves
}

export function applyMove(
  board: Board,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
): Board {
  const next = board.map((row) => row.map((c) => (c ? { ...c } : null)))
  const piece = next[fy]![fx]
  if (!piece) return next
  next[fy]![fx] = null
  if (piece.type === 'pawn' && (ty === 0 || ty === 7)) {
    next[ty]![tx] = { type: 'queen', color: piece.color }
  } else {
    next[ty]![tx] = piece
  }
  return next
}

export function botMove(board: Board, color: Color, difficulty: string): [number, number, number, number] | null {
  const candidates: [number, number, number, number][] = []
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y]![x]
      if (!p || p.color !== color) continue
      for (const [mx, my] of getMoves(board, x, y)) {
        candidates.push([x, y, mx, my])
      }
    }
  }
  if (!candidates.length) return null
  if (difficulty === 'easy') {
    const c = candidates[Math.floor(Math.random() * candidates.length)]!
    return c
  }
  const scored = candidates.map((m) => {
    const target = board[m[3]]![m[2]]
    let score = target ? pieceValue(target.type) : 0
    if (difficulty === 'hard' && target?.type === 'king') score += 100
    return { m, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter((s) => s.score === scored[0]!.score)
  return top[Math.floor(Math.random() * top.length)]!.m
}

function pieceValue(t: PieceType): number {
  return { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 }[t]
}
