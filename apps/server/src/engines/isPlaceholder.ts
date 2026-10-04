import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'
import { QUERY_PLACEHOLDER } from './queryPlaceholder'

export const isPlaceholder = (arg: string): boolean =>
  arg === PAGE_ID_PLACEHOLDER || arg === QUERY_PLACEHOLDER
