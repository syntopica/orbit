import type { HeldClipsDocuments } from '../../types/HeldClipsDocuments'
import type { LatestClipsDocuments } from '../../types/LatestClipsDocuments'

export const createLatestClipsDocuments = (
  now: () => number,
): LatestClipsDocuments => {
  let held: HeldClipsDocuments | null = null
  return {
    put: (documents) => {
      held = { documents, at: now() }
    },
    get: (maxAgeMs) =>
      held !== null && now() - held.at <= maxAgeMs ? held.documents : null,
    last: () => held,
  }
}
