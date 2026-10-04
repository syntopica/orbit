import type { PendingView } from '@orbit/contract'

export const createTodoItem = (
  source: string,
  file: string,
  line: number,
  values: {
    state: 'open' | 'partial' | 'blocked'
    title: string
    section: string | null
  },
): PendingView['items'][number] => ({
  id: `${source}:${String(line)}`,
  source,
  kind: 'todo',
  state: values.state,
  title: values.title,
  detail: '',
  section: values.section,
  ref: { file, line },
  ageMs: null,
})
