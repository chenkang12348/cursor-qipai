import { thinkDelay, type BotDifficulty } from './BotPlayer'

export async function runBotTurn<TAction>(
  difficulty: BotDifficulty,
  decide: () => TAction | Promise<TAction>,
  onThinking?: (thinking: boolean) => void,
): Promise<TAction> {
  onThinking?.(true)
  await new Promise((r) => setTimeout(r, thinkDelay(difficulty)))
  const action = await decide()
  onThinking?.(false)
  return action
}
