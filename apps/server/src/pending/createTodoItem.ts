import type { PendingView } from '@orbit/contract'
import type { TodoItemValues } from '../types/TodoItemValues'

export const createTodoItem = (
  source: string,
  file: string,
  line: number,
  values: TodoItemValues,
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
