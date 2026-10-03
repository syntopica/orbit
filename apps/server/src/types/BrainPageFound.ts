import type { BrainPageDocument } from './BrainPageDocument'

export type BrainPageFound = Extract<BrainPageDocument, { body: string }>
