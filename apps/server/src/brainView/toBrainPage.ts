import type { BrainPage } from '@orbit/contract'

import type { BrainPageFound } from '../types/BrainPageFound'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { capBrainBody } from './capBrainBody'
import { isPageId } from './isPageId'
import { textOrNull } from './textOrNull'
import { toSources } from './toSources'

// D1: the fixed frontmatter fields only; links outside the page id pattern
// are dropped so every link the screen draws can be requested in turn.
export const toBrainPage = (id: string, doc: BrainPageFound): BrainPage => {
  const front = doc.frontmatter
  const body = capBrainBody(doc.body)
  return {
    id,
    title: textOrNull(front['title'], 512),
    type: identifierOrNull(textOrNull(front['type'], 128)),
    updated: textOrNull(front['updated'], 64),
    summary: textOrNull(front['summary'], 2048),
    sources: toSources(front['sources']),
    body,
    truncated: doc.truncated || body !== doc.body,
    outbound: doc.links.outbound
      .filter((link) => isPageId(link.target))
      .map(({ target, exists }) => ({ target, exists })),
    inbound: doc.links.inbound.filter((other) => isPageId(other)),
  }
}
