import { useSyncExternalStore } from 'react'

export const useOrbitVisibility = (): boolean =>
  useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => {
        document.removeEventListener('visibilitychange', onChange)
      }
    },
    () => document.visibilityState === 'visible',
  )
