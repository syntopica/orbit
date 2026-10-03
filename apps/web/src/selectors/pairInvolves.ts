import type { BrainRelated } from '@orbit/contract'

export const pairInvolves = (
  pair: BrainRelated['pairs'][number],
  id: string | null,
): boolean => pair.left === id || pair.right === id
