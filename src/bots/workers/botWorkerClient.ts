/**
 * Bot Web Worker — 本地运算，无网络请求
 * hard 难度可将重计算放入 Worker 避免阻塞 UI
 */

export interface WorkerTask {
  game: 'gomoku'
  payload: unknown
}

export interface WorkerResult {
  result: unknown
}

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./botWorker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

export function runInBotWorker<T>(task: WorkerTask, timeoutMs = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const w = getWorker()
    const timer = setTimeout(() => reject(new Error('Bot worker timeout')), timeoutMs)

    const handler = (e: MessageEvent<WorkerResult>) => {
      clearTimeout(timer)
      w.removeEventListener('message', handler)
      resolve(e.data.result as T)
    }
    w.addEventListener('message', handler)
    w.postMessage(task)
  })
}

export function terminateBotWorker(): void {
  worker?.terminate()
  worker = null
}
