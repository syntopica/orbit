import { useCallback, useEffect, useRef, useState } from 'react'

import { selectNewlyDown } from '../selectors/selectNewlyDown'
import type { DownTracking } from '../types/DownTracking'
import type { Toast } from '../types/Toast'
import type { ToastsModel } from '../types/ToastsModel'
import { useStream } from './useStream'
import { useToastExpiry } from './useToastExpiry'

export const useDownToasts = (): ToastsModel => {
  const { snapshots, synced } = useStream()
  const previous = useRef<DownTracking>({ snapshots, synced })
  const [toasts, setToasts] = useState<readonly Toast[]>([])
  useEffect(() => {
    const before = previous.current
    previous.current = { snapshots, synced }
    if (!synced || !before.synced) return
    const at = Date.now()
    const fresh = selectNewlyDown(before.snapshots, snapshots).map(
      (component) => ({
        id: `${component}:${String(at)}`,
        component,
        reason: snapshots[component]?.health.reason ?? null,
      }),
    )
    if (fresh.length > 0)
      setToasts((current) => [...current, ...fresh].slice(-4))
  }, [snapshots, synced])
  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])
  useToastExpiry(toasts, dismiss)
  return { toasts, dismiss }
}
