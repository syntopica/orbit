import { timingSafeEqual } from 'node:crypto'

export const secretsEqual = (aHex: string, bHex: string): boolean => {
  const a = Buffer.from(aHex, 'hex')
  const b = Buffer.from(bHex, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
