import { timingSafeEqual } from 'node:crypto'

export const secretsEqual = (aHex: string, bHex: string): boolean => {
  const valid = /^(?:[0-9a-f]{2})+$/
  if (!valid.test(aHex) || !valid.test(bHex)) return false
  const a = Buffer.from(aHex, 'hex')
  const b = Buffer.from(bHex, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
