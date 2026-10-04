import type { AtriumPassesDocument } from './AtriumPassesDocument'

export type AtriumAdapterDeps = {
  readonly statusDir: string
  readonly refreshIntervalMs: number
  readonly cadenceMs: number
  readonly readPasses?: (signal: AbortSignal) => Promise<AtriumPassesDocument>
}
