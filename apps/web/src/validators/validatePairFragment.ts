import type { PairFragment } from '../types/PairFragment'

// Server contract: 8-byte id and 16-byte secret in base64url (11 and 22 chars).
export const validatePairFragment = (hash: string): PairFragment | null => {
  const match = /^([\w-]{11})\.([\w-]{22})$/.exec(hash.replace(/^#/, ''))
  const id = match?.[1]
  const secret = match?.[2]
  return id === undefined || secret === undefined ? null : { id, secret }
}
