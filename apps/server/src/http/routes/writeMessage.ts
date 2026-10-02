import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

export const writeMessage = async (
  stream: SSEStreamingApi,
  message: StreamMessage,
  withId: boolean,
): Promise<void> =>
  stream.writeSSE(
    withId
      ? { id: String(message.id), data: JSON.stringify(message) }
      : { data: JSON.stringify(message) },
  )
