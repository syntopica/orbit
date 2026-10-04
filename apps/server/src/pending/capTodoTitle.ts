import type { PendingView } from '@orbit/contract'

// A title over the cap ends in an ellipsis, and the whole paragraph moves to
// the head of the detail so nothing is lost.
export const capTodoTitle = (
  item: PendingView['items'][number],
): PendingView['items'][number] => {
  const TITLE_MAX = 300
  if (item.title.length <= TITLE_MAX) return item
  const detail = item.detail ? `${item.title}\n${item.detail}` : item.title
  return {
    ...item,
    title: `${item.title.slice(0, TITLE_MAX - 1).trimEnd()}…`,
    detail: detail.slice(0, 4000),
  }
}
