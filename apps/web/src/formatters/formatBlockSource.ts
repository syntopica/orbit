import type { AtriumContext } from '@orbit/contract'

import { formatUtcDay } from './formatUtcDay'

// Rank, provider, role, where the block came from and when, as one label line.
export const formatBlockSource = (
  block: AtriumContext['blocks'][number],
): string =>
  [
    `#${String(block.rank)}`,
    block.provider,
    block.role,
    block.notePath ?? block.conversationId,
    block.authoredAt === null ? null : formatUtcDay(block.authoredAt),
  ]
    .filter((part) => part !== null)
    .join(' · ')
