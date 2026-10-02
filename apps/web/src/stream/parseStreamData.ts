import { type StreamMessage, streamMessageSchema } from '@orbit/contract'

export const parseStreamData = (data: string): StreamMessage | null => {
  try {
    const parsed = streamMessageSchema.safeParse(JSON.parse(data))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
