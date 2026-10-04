import type { PendingView } from '@orbit/contract'

import { appendTodoDetail } from './appendTodoDetail'
import { createTodoItem } from './createTodoItem'
import { todoState } from './todoState'

export const parseTodoItems = (
  content: string,
  source: string,
  file: string,
): PendingView['items'] => {
  const items: PendingView['items'][number][] = []
  let section: string | null = null
  let current: PendingView['items'][number] | null = null
  for (const [index, raw] of content.split(/\r?\n/).entries()) {
    const line = raw.replace(/\r$/, '')
    if (line.startsWith('## ')) {
      section = line.slice(3).trim()
      current = null
      continue
    }
    if (/^\s*$|^#{1,6}\s/.test(line)) {
      current = null
      continue
    }
    const marker = /^- \[([ ~!x-])\](?:\s(.*))?$/.exec(line)
    if (marker !== null) {
      current = null
      const state = todoState(marker[1] ?? '')
      if (state === null) continue
      current = createTodoItem(source, file, index + 1, {
        state,
        title: marker[2] ?? '',
        section,
      })
      items.push(current)
      continue
    }
    if (current !== null && /^\s+\S/.test(line)) appendTodoDetail(current, line)
    else current = null
  }
  return items
}
