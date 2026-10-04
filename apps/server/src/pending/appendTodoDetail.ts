import type { PendingView } from '@orbit/contract'

export const appendTodoDetail = (
  item: PendingView['items'][number],
  line: string,
): void => {
  item.detail = `${item.detail}${item.detail ? '\n' : ''}${line}`.slice(0, 4000)
}
