import type { AtriumContext } from '@orbit/contract'

import type { AtriumContextDocument } from '../types/AtriumContextDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { isIdentifier } from '../workerView/isIdentifier'
import { toContextBlock } from './toContextBlock'

// The query itself is never echoed back; warnings are codes.
export const toAtriumContext = (
  doc: AtriumContextDocument,
  now: number,
): AtriumContext => ({
  now,
  blocks: doc.evidence.map(toContextBlock),
  textChars: doc.text_chars,
  limit: doc.limit,
  maxChars: doc.max_chars,
  warnings: doc.warnings.filter(isIdentifier),
  freshnessStatus: identifierOrNull(doc.freshness?.status),
})
