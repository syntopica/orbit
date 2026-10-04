import type { TodoFile } from '../types/TodoFile'
import type { TodoSourceResult } from '../types/TodoSourceResult'
import { parseTodoItems } from './parseTodoItems'
import { readCappedTodoFile } from './readCappedTodoFile'

export const readTodoSource = async (
  file: TodoFile,
  signal: AbortSignal,
): Promise<TodoSourceResult> => {
  const id = `todo:${file.name}`
  const source: TodoSourceResult['source'] = {
    id,
    kind: 'todo',
    name: file.name,
    status: 'ok',
    count: 0,
  }
  try {
    const bytes = await readCappedTodoFile(file.path, signal)
    if (bytes === null)
      return { source: { ...source, status: 'too_large' }, items: [] }
    const items = parseTodoItems(bytes.toString('utf8'), id, file.path)
    return { source: { ...source, count: items.length }, items }
  } catch (error) {
    if (signal.aborted) throw error
    return { source: { ...source, status: 'unreadable' }, items: [] }
  }
}
