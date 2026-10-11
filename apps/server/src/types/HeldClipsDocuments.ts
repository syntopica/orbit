import type { ClipsDocuments } from './ClipsDocuments'

// A clips read with the epoch millisecond it was taken at.
export type HeldClipsDocuments = {
  readonly documents: ClipsDocuments
  readonly at: number
}
