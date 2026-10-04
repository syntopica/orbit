import type { AtriumPassesDocument } from './AtriumPassesDocument'
import type { AtriumRecentDocument } from './AtriumRecentDocument'
import type { AtriumShowDocument } from './AtriumShowDocument'

export type AtriumSynthesisReaders = {
  readonly passes: (signal: AbortSignal) => Promise<AtriumPassesDocument>
  readonly recent: (signal: AbortSignal) => Promise<AtriumRecentDocument>
  readonly record: (
    jobKey: string,
    signal: AbortSignal,
  ) => Promise<AtriumShowDocument>
}
