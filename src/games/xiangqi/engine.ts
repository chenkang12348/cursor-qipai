// 中国象棋引擎（含将军、应将、将帅对面、合法走法）
export type PieceType = 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p'
export type Color = 'red' | 'black'

export interface Piece {
  type: PieceType
  color: Color
}

export type Board = (Piece | null)[][]

export type GameResult = 'playing' | 'checkmate' | 'stalemate'

const PIECE_CHAR: Record<Color, Record<PieceType, string>> = {
  red: { k: '帅', a: '仕', b: '相', n: '马', r: '车', c: '炮', p: '兵' },
  black: { k: '将', a: '士', b: '象', n: '马', r: '车', c: '炮', p: '卒' },
}

export function pieceLabel(p: Piece): string {
  return PIECE_CHAR[p.color][p.type]
}

export function initialBoard(): Board {
  const b: Board = Array.from({ length: 10 }, () => Array(9).fill(null))
  const back: PieceType[] = ['r', 'n', 'b', 'a', 'k', 'a', 'b', 'n', 'r']
  back.forEach((t, x) => {
    b[0]![x] = { type: t, color: 'black' }
    b[9]![x] = { type: t, color: 'red' }
  })
  ;[0, 2, 4, 6, 8].forEach((x) => {
    b[2]![x] = { type: 'c', color: 'black' }
    b[7]![x] = { type: 'c', color: 'red' }
  })
  ;[0, 2, 4, 6, 8].forEach((x) => {
    b[3]![x] = { type: 'p', color: 'black' }
    b[6]![x] = { type: 'p', color: 'red' }
  })
  return b
}

export function inPalace(x: number, y: number, color: Color): boolean {
  if (x < 3 || x > 5) return false
  return color === 'red' ? y >= 7 : y <= 2
}

export function findKing(board: Board, color: Color): [number, number] | null {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const p = board[y]![x]
      if (p?.type === 'k' && p.color === color) return [x, y]
    }
  }
  return null
}

/** 将帅是否在同一列且中间无子（白脸将，非法局面） */
export function kingsFaceEachOther(board: Board): boolean {
  const red = findKing(board, 'red')
  const black = findKing(board, 'black')
  if (!red || !black || red[0] !== black[0]) return false
  const col = red[0]
  const yMin = Math.min(red[1], black[1])
  const yMax = Math.max(red[1], black[1])
  for (let y = yMin + 1; y < yMax; y++) {
    if (board[y]![col]) return false
  }
  return true
}

/** 伪合法走法（不考虑将军与将帅对面） */
export function getPseudoMoves(board: Board, x: number, y: number): [number, number][] {
  const piece = board[y]![x]
  if (!piece) return []
  const moves: [number, number][] = []
  const add = (nx: number, ny: number) => {
    if (nx < 0 || nx > 8 || ny < 0 || ny > 9) return
    const target = board[ny]![nx]
    if (!target || target.color !== piece.color) moves.push([nx, ny])
  }

  switch (piece.type) {
    case 'k':
      for (const [dx, dy] of [
        [0, 1], [0, -1], [1, 0], [-1, 0],
      ]) {
        const nx = x + dx!
        const ny = y + dy!
        if (inPalace(nx, ny, piece.color)) add(nx, ny)
      }
      break
    case 'p': {
      const forward = piece.color === 'red' ? -1 : 1
      const ny = y + forward
      if (ny >= 0 && ny <= 9) add(x, ny)
      const crossed = piece.color === 'red' ? y <= 4 : y >= 5
      if (crossed) {
        if (x > 0) add(x - 1, y)
        if (x < 8) add(x + 1, y)
      }
      break
    }
    case 'r':
    case 'c': {
      for (const [dx, dy] of [
        [1, 0], [-1, 0], [0, 1], [0, -1],
      ]) {
        let nx = x + dx!
        let ny = y + dy!
        let jumped = false
        while (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 9) {
          const t = board[ny]![nx]
          if (piece.type === 'r') {
            if (!t) moves.push([nx, ny])
            else {
              if (t.color !== piece.color) moves.push([nx, ny])
              break
            }
          } else if (!t) {
            if (!jumped) moves.push([nx, ny])
          } else if (!jumped) {
            jumped = true
          } else {
            if (t.color !== piece.color) moves.push([nx, ny])
            break
          }
          nx += dx!
          ny += dy!
        }
      }
      break
    }
    case 'n': {
      const jumps: [number, number, number, number][] = [
        [1, 0, 2, 1], [1, 0, 2, -1], [-1, 0, -2, 1], [-1, 0, -2, -1],
        [0, 1, 1, 2], [0, 1, -1, 2], [0, -1, 1, -2], [0, -1, -1, -2],
      ]
      for (const [bx, by, tx, ty] of jumps) {
        if (board[y + by]![x + bx]) continue
        add(x + tx, y + ty)
      }
      break
    }
    case 'b': {
      const deltas = [
        [2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1],
      ]
      for (const [tx, ty, bx, by] of deltas) {
        const nx = x + tx
        const ny = y + ty
        if (nx < 0 || nx > 8 || ny < 0 || ny > 9) continue
        if (piece.color === 'red' && ny < 5) continue
        if (piece.color === 'black' && ny > 4) continue
        if (board[y + by]![x + bx]) continue
        add(nx, ny)
      }
      break
    }
    case 'a': {
      for (const [dx, dy] of [
        [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        const nx = x + dx!
        const ny = y + dy!
        if (inPalace(nx, ny, piece.color)) add(nx, ny)
      }
      break
    }
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
  next[ty]![tx] = next[fy]![fx]
  next[fy]![fx] = null
  return next
}

/** 某格是否被对方攻击 */
export function isSquareAttacked(board: Board, x: number, y: number, byColor: Color): boolean {
  for (let py = 0; py < 10; py++) {
    for (let px = 0; px < 9; px++) {
      const p = board[py]![px]
      if (!p || p.color !== byColor) continue
      if (getPseudoMoves(board, px, py).some(([mx, my]) => mx === x && my === y)) {
        return true
      }
    }
  }
  return false
}

export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color)
  if (!king) return true
  const opponent: Color = color === 'red' ? 'black' : 'red'
  return isSquareAttacked(board, king[0], king[1], opponent)
}

export function isMoveLegal(
  board: Board,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
): boolean {
  const piece = board[fy]![fx]
  if (!piece) return false
  const pseudo = getPseudoMoves(board, fx, fy)
  if (!pseudo.some(([mx, my]) => mx === tx && my === ty)) return false

  const next = applyMove(board, fx, fy, tx, ty)
  if (kingsFaceEachOther(next)) return false
  if (isInCheck(next, piece.color)) return false
  return true
}

/** 合法走法（含应将规则） */
export function getLegalMoves(board: Board, x: number, y: number): [number, number][] {
  return getPseudoMoves(board, x, y).filter(([tx, ty]) => isMoveLegal(board, x, y, tx, ty))
}

export function getAllLegalMoves(board: Board, color: Color): [number, number, number, number][] {
  const moves: [number, number, number, number][] = []
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const p = board[y]![x]
      if (!p || p.color !== color) continue
      for (const [tx, ty] of getLegalMoves(board, x, y)) {
        moves.push([x, y, tx, ty])
      }
    }
  }
  return moves
}

export function getGameResult(board: Board, sideToMove: Color): GameResult {
  const legal = getAllLegalMoves(board, sideToMove)
  if (legal.length > 0) return 'playing'
  return isInCheck(board, sideToMove) ? 'checkmate' : 'stalemate'
}

const PIECE_VALUE: Record<PieceType, number> = {
  p: 1, n: 4, b: 2, a: 2, c: 5, r: 9, k: 100,
}

export function botMove(
  board: Board,
  color: Color,
  difficulty: string,
): [number, number, number, number] | null {
  const candidates = getAllLegalMoves(board, color)
  if (!candidates.length) return null

  if (difficulty === 'easy') {
    const c = candidates[Math.floor(Math.random() * candidates.length)]!
    return c
  }

  const scored = candidates.map((m) => {
    const target = board[m[3]]![m[2]]
    let score = target ? PIECE_VALUE[target.type] : 0
    const next = applyMove(board, m[0], m[1], m[2], m[3])
    const opp: Color = color === 'red' ? 'black' : 'red'
    if (isInCheck(next, opp)) score += 3
    if (difficulty === 'hard' && getGameResult(next, opp) === 'checkmate') score += 50
    return { m, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter((s) => s.score === scored[0]!.score)
  return top[Math.floor(Math.random() * top.length)]!.m
}

/** @deprecated 使用 getLegalMoves */
export function getMoves(board: Board, x: number, y: number): [number, number][] {
  return getLegalMoves(board, x, y)
}
