import type { BrainChecksDocuments } from './BrainChecksDocuments'
import type { BrainGraphDocument } from './BrainGraphDocument'
import type { BrainPageDocument } from './BrainPageDocument'
import type { BrainRelatedDocument } from './BrainRelatedDocument'

export type BrainReaders = {
  readonly graph: (signal: AbortSignal) => Promise<BrainGraphDocument>
  readonly related: (signal: AbortSignal) => Promise<BrainRelatedDocument>
  readonly page: (id: string, signal: AbortSignal) => Promise<BrainPageDocument>
  readonly checks: (signal: AbortSignal) => Promise<BrainChecksDocuments>
}
