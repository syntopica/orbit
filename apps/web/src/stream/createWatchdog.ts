import type { Watchdog } from '../types/Watchdog'

export const createWatchdog = (ms: number, onSilence: () => void): Watchdog => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    reset: () => {
      clearTimeout(timer)
      timer = setTimeout(onSilence, ms)
    },
    stop: () => {
      clearTimeout(timer)
    },
  }
}
