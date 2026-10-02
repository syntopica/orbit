import type { BucketInput } from '../types/BucketInput'
import type { BucketState } from '../types/BucketState'
import { isMissed } from './isMissed'

export const classifyBucket = (input: BucketInput): BucketState => {
  if (!input.covered) return 'unknown'
  if (input.role === 'keepalive') {
    return (input.atEnd?.pid ?? null) === null ? 'failed' : 'ok'
  }
  const exits = [...input.inBucket, input.atEnd].map((o) => o?.lastExit ?? 0)
  if (exits.some((code) => code !== 0)) return 'failed'
  if (input.runInBucket) return 'ok'
  return isMissed(input) ? 'missed' : 'idle'
}
