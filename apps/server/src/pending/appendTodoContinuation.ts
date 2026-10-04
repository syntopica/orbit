import type { PendingView } from '@orbit/contract'

import { appendTodoDetail } from './appendTodoDetail'

// A hard-wrapped item's first paragraph is its title, as markdown reads it;
// a nested list or code fence starts the detail. Returns whether the title is
// still open.
export const appendTodoContinuation = (
  item: PendingView['items'][number],
  line: string,
  titleOpen: boolean,
): boolean => {
  if (titleOpen && !/^\s+(?:[-*+]\s|\d+[.)]\s|```)/.test(line)) {
    item.title = `${item.title} ${line.trim()}`.trim()
    return true
  }
  appendTodoDetail(item, line)
  return false
}
