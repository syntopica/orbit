import type { StreamMessage } from '@orbit/contract'

import type { Ring } from '../types/Ring'

export const createRing = (capacity: number): Ring => {
  const items: StreamMessage[] = []
  return {
    push: (message) => {
      items.push(message)
      if (items.length > capacity) items.shift()
    },
    after: (id) => {
      const first = items[0]
      const last = items.at(-1)
      if (first === undefined || last === undefined) return null
      if (id < first.id - 1 || id > last.id) return null
      return items.filter((message) => message.id > id)
    },
  }
}
