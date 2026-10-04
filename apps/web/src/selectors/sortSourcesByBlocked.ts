import type { PendingView } from '@orbit/contract'

// Sources with the most blocked items first; ties keep the configured order.
export const sortSourcesByBlocked = (
  sources: PendingView['sources'],
  items: PendingView['items'],
): PendingView['sources'] => {
  const blocked = (id: string) =>
    items.filter((item) => item.source === id && item.state === 'blocked')
      .length
  return sources
    .map((source, index) => ({ source, index, blocked: blocked(source.id) }))
    .sort((a, b) => b.blocked - a.blocked || a.index - b.index)
    .map(({ source }) => source)
}
