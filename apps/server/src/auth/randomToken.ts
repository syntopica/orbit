import { randomBytes } from 'node:crypto'

export const randomToken = (bytes: number): string =>
  randomBytes(bytes).toString('base64url')
