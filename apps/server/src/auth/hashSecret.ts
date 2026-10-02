import { createHash } from 'node:crypto'

export const hashSecret = (secret: string): string =>
  createHash('sha256').update(secret).digest('hex')
