import { probeSession } from '../api/probeSession'
import type { StreamHandlers } from '../types/StreamHandlers'
import { createWatchdog } from './createWatchdog'
import { parseStreamData } from './parseStreamData'

export const connectStream = (
  handlers: StreamHandlers,
  retryMs = 5_000,
): (() => void) => {
  let source: EventSource | null = null
  let retry: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  const watchdog = createWatchdog(45_000, () => {
    handlers.onStatus('stale')
  })
  const alive = (): void => {
    watchdog.reset()
    handlers.onStatus('live')
  }
  const settle = async (): Promise<void> => {
    const authorized = await probeSession()
    if (stopped) return
    if (authorized) retry = setTimeout(open, retryMs)
    else handlers.onStatus('unauthorized')
  }
  const open = (): void => {
    const current = new EventSource('/api/stream')
    source = current
    current.onopen = alive
    current.addEventListener('ping', alive)
    current.onmessage = (event: MessageEvent<string>) => {
      alive()
      const message = parseStreamData(event.data)
      if (message !== null) handlers.onMessage(message)
    }
    current.onerror = () => {
      handlers.onStatus('offline')
      if (current.readyState !== EventSource.CLOSED) return
      void settle()
    }
  }
  open()
  return () => {
    stopped = true
    clearTimeout(retry)
    watchdog.stop()
    source?.close()
  }
}
