import { readAtriumDocuments } from '../adapters/atrium/readAtriumDocuments'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { AtriumDeps } from '../types/AtriumDeps'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import type { OrbitConfig } from '../types/OrbitConfig'

export const buildAtriumReader = (
  atrium: OrbitConfig['atrium'],
  cadenceMs: number,
): AtriumDeps | null => {
  if (atrium === undefined) return null
  const cached = createTtlCache<AtriumDocuments>(cadenceMs, Date.now)
  return {
    refreshIntervalMs: atrium.refreshIntervalMs,
    read: async (signal) =>
      cached(async () => readAtriumDocuments(atrium.statusDir, signal)),
  }
}
