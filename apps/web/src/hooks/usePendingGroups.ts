import type { PendingView } from '@orbit/contract'
import { useState } from 'react'

import { defaultGroupOpen } from '../selectors/defaultGroupOpen'
import type { PendingGroupOverrides } from '../types/PendingGroupOverrides'
import type { validatePendingSearch } from '../validators/validatePendingSearch'

// Which source groups are open. Hand toggles last until the filters change,
// so a new search opens the groups it matched again.
export const usePendingGroups = (
  items: PendingView['items'],
  filters: ReturnType<typeof validatePendingSearch>,
) => {
  const [overrides, setOverrides] = useState<PendingGroupOverrides>({
    key: '',
    open: {},
  })
  const key = JSON.stringify(filters)
  const open = overrides.key === key ? overrides.open : {}
  const ids = [...new Set(items.map((item) => item.source))]
  const isOpen = (id: string) =>
    open[id] ??
    defaultGroupOpen(items.filter((item) => item.source === id).length, filters)
  return {
    isOpen,
    allOpen: ids.length > 0 && ids.every(isOpen),
    setOpen: (id: string, value: boolean) => {
      if (isOpen(id) !== value)
        setOverrides({ key, open: { ...open, [id]: value } })
    },
    setAll: (value: boolean) => {
      setOverrides({
        key,
        open: Object.fromEntries(ids.map((id) => [id, value])),
      })
    },
  }
}
