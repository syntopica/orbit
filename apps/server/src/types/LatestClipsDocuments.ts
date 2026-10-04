import type { ClipsDocuments } from './ClipsDocuments'

// The clips adapter's last successful read, kept in memory only (never the
// snapshot, the stream or the history store) so the detail route and the
// pending board reuse the poll instead of running the engine again.
export type LatestClipsDocuments = {
  readonly put: (documents: ClipsDocuments) => void
  readonly get: (maxAgeMs: number) => ClipsDocuments | null
}
