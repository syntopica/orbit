import type { AtriumContextDocument } from './AtriumContextDocument'

export type AtriumContextReader = (
  query: string,
  signal: AbortSignal,
) => Promise<AtriumContextDocument>
