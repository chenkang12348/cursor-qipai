export type BotDifficulty = 'easy' | 'medium' | 'hard'

export interface BotPlayer<TState, TAction> {
  difficulty: BotDifficulty
  decide(state: TState, seat: number): Promise<TAction>
}

export function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function thinkDelay(difficulty: BotDifficulty): number {
  const base = { easy: 400, medium: 600, hard: 900 }[difficulty]
  return base + Math.random() * 400
}
