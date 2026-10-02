import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { CommandPaletteModel } from '../types/CommandPaletteModel'
import { useHotkey } from './useHotkey'

export const useCommandPalette = (): CommandPaletteModel => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const leave = async (): Promise<void> => {
    try {
      await apiFetch('/api/logout', { method: 'POST' })
    } catch {
      // Offline: the session cookie stays, but the person still asked to leave.
    }
    await navigate({ to: '/login' })
  }
  useHotkey(
    'k',
    useCallback(() => {
      setOpen((current) => !current)
    }, []),
  )
  return {
    open,
    setOpen,
    go: (to) => {
      setOpen(false)
      void navigate({ to })
    },
    signOut: () => {
      setOpen(false)
      void leave()
    },
  }
}
