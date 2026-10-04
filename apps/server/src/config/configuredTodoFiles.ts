import type { OrbitConfig } from '../types/OrbitConfig'
import type { TodoFile } from '../types/TodoFile'

export const configuredTodoFiles = (config: OrbitConfig): readonly TodoFile[] =>
  config.pending?.todoFiles ?? []
