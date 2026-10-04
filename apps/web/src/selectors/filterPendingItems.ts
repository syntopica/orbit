import type { PendingView } from '@orbit/contract'

import type { validatePendingSearch } from '../validators/validatePendingSearch'

export const filterPendingItems = (
  items: PendingView['items'],
  filters: ReturnType<typeof validatePendingSearch>,
): PendingView['items'] =>
  items.filter((item) => {
    if (filters.state !== undefined && item.state !== filters.state)
      return false
    if (filters.source !== undefined && item.source !== filters.source)
      return false
    const text = (filters.q ?? '').toLocaleLowerCase()
    return `${item.title}\n${item.detail}`.toLocaleLowerCase().includes(text)
  })
