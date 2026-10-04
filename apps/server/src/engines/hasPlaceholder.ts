import { isPlaceholder } from './isPlaceholder'

export const hasPlaceholder = (args: readonly string[]): boolean =>
  args.some(isPlaceholder)
