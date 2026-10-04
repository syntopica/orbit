import type { AtriumContext } from '@orbit/contract'

import { textOrNull } from '../brainView/textOrNull'
import { epochOrNull } from '../time/epochOrNull'
import type { AtriumContextDocument } from '../types/AtriumContextDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'

// One evidence item as a labelled block, ranked from 1 in atrium's order.
// Labels are identifiers, the conversation id is shortened to 12 characters,
// and `chars` counts code points as atrium does.
export const toContextBlock = (
  {
    text,
    trust,
    role,
    provider,
    conversation_id: conversationId,
    note_path: notePath,
    authored_at: authoredAt,
    truncated,
  }: AtriumContextDocument['evidence'][number],
  index: number,
): AtriumContext['blocks'][number] => ({
  rank: index + 1,
  trust,
  role: identifierOrNull(role),
  provider: identifierOrNull(provider),
  notePath: textOrNull(notePath, 512),
  conversationId: identifierOrNull(conversationId?.slice(0, 12)),
  authoredAt: epochOrNull(authoredAt),
  chars: Array.from(text).length,
  text,
  truncated,
})
