import type { Readable } from 'node:stream'

export const collectOutput = (
  stream: Readable,
  maxBytes: number,
  onOverflow: () => void,
): (() => string) => {
  const chunks: Buffer[] = []
  let size = 0
  stream.on('data', (chunk: Buffer) => {
    size += chunk.length
    if (size > maxBytes) onOverflow()
    else chunks.push(chunk)
  })
  return () => Buffer.concat(chunks).toString('utf8')
}
