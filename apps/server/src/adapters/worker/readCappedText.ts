import { ProcessError } from '../../process/ProcessError'

export const readCappedText = async (response: Response): Promise<string> => {
  if (response.body === null) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of response.body as AsyncIterable<Uint8Array>) {
    total += chunk.byteLength
    if (total > 1_048_576) throw new ProcessError('output_too_large')
    chunks.push(chunk)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}
