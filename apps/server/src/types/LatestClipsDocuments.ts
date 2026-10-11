import type { ClipsDocuments } from './ClipsDocuments'
import type { HeldClipsDocuments } from './HeldClipsDocuments'

// The clips adapter's last successful read, kept in memory only (never the
// snapshot, the stream or the history store) so the detail route and the
// pending board reuse the poll instead of running the engine again. `last`
// returns it at any age, for a screen that would otherwise show nothing.
export type LatestClipsDocuments = {
  readonly put: (documents: ClipsDocuments) => void
  readonly get: (maxAgeMs: number) => ClipsDocuments | null
  readonly last: () => HeldClipsDocuments | null
}
