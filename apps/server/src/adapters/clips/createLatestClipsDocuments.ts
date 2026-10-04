import type { ClipsDocuments } from '../../types/ClipsDocuments'
import type { LatestClipsDocuments } from '../../types/LatestClipsDocuments'

export const createLatestClipsDocuments = (
  now: () => number,
): LatestClipsDocuments => {
  let held: { documents: ClipsDocuments; at: number } | null = null
  return {
    put: (documents) => {
      held = { documents, at: now() }
    },
    get: (maxAgeMs) =>
      held !== null && now() - held.at <= maxAgeMs ? held.documents : null,
  }
}
