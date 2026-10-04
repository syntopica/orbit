import type { AtriumSynthesisRow } from '@orbit/contract'

import { formatCount } from './formatCount'
import { formatLocalTime } from './formatLocalTime'
import { shortenId } from './shortenId'

// What the synthesis read, by reference: the conversation and its episode,
// or the session window a session recorded itself.
export const formatSynthesisInput = (row: AtriumSynthesisRow): string => {
  const conversation = `conversation ${shortenId(row.conversationId ?? '—')}`
  if (row.kind === 'session') {
    const since =
      row.sessionSince === null ? '—' : formatLocalTime(row.sessionSince)
    const until =
      row.sessionUntil === null ? '—' : formatLocalTime(row.sessionUntil)
    return `${conversation} · session ${since} to ${until}`
  }
  const chunks =
    row.mapChunks === null ? '' : ` in ${formatCount(row.mapChunks)} chunks`
  return `${conversation} · episode ${shortenId(row.episodeId ?? '—')} · ${formatCount(row.eventCount)} events${chunks}`
}
