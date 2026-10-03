import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

export const hasPlaceholder = (args: readonly string[]): boolean =>
  args.includes(PAGE_ID_PLACEHOLDER)
