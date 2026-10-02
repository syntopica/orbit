// Reads raw SSE blocks until `done` accepts them, then cancels the stream.
export const readSseBlocks = async (
  res: Response,
  done: (blocks: string[]) => boolean,
): Promise<string[]> => {
  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
    res.body?.getReader()
  const decoder = new TextDecoder()
  let text = ''
  while (reader !== undefined) {
    const chunk = await reader.read()
    if (chunk.done) break
    text += decoder.decode(chunk.value)
    if (done(text.split('\n\n').slice(0, -1))) break
  }
  await reader?.cancel()
  return text.split('\n\n').slice(0, -1)
}
