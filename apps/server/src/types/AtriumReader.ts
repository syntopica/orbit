import type { AtriumDocuments } from './AtriumDocuments'

export type AtriumReader = (signal: AbortSignal) => Promise<AtriumDocuments>
