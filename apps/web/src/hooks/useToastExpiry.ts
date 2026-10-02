import { useEffect, useRef } from 'react'

import type { Toast } from '../types/Toast'

export const useToastExpiry = (
  toasts: readonly Toast[],
  dismiss: (id: string) => void,
): void => {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  useEffect(() => {
    for (const { id } of toasts) {
      if (timers.current.has(id)) continue
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id)
          dismiss(id)
        }, 8_000),
      )
    }
  }, [toasts, dismiss])
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
      pending.clear()
    }
  }, [])
}
