import { useState } from 'react'

import { COLUMN_STEPS } from '../charts/columnSteps'
import type { ColumnFocus } from '../types/ColumnFocus'

export const useColumnFocus = (count: number): ColumnFocus => {
  const [active, setActive] = useState<number | null>(null)
  const show = (index: number) => {
    setActive(Math.min(count - 1, Math.max(0, index)))
  }
  return {
    active: active !== null && active < count ? active : null,
    show,
    clear: () => {
      setActive(null)
    },
    onKeyDown: (event) => {
      const step = COLUMN_STEPS[event.key]
      if (event.key === 'Home') show(0)
      else if (event.key === 'End') show(count - 1)
      else if (event.key === 'Escape') setActive(null)
      else if (step === undefined) return
      else show((active ?? count - 1) + step)
      event.preventDefault()
    },
    onFocus: () => {
      setActive((current) => current ?? count - 1)
    },
  }
}
