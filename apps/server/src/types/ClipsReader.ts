import type { ClipsDocuments } from './ClipsDocuments'

export type ClipsReader = (signal: AbortSignal) => Promise<ClipsDocuments>
