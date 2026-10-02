import type { BucketInput } from '../types/BucketInput'

export const isMissed = (input: BucketInput): boolean =>
  input.missWindow !== null && input.missWindow.watched && !input.missWindow.ran
