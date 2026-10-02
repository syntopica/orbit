import { createHub } from '../hub/createHub'
import { startTestServer } from '../test/startTestServer'

vi.mock(import('../hub/createHub'), async (importOriginal) => {
  const original = await importOriginal()
  return { createHub: vi.fn(original.createHub) }
})

describe('startServer hub', () => {
  it('keeps the spec ring of 1000 messages and ids that start at the clock in ms', async () => {
    const before = Date.now()
    const { controller } = await startTestServer()
    const options = vi.mocked(createHub).mock.calls[0]?.[0]
    expect(options?.ringSize).toBe(1000)
    expect(options?.recentEvents).toBe(50)
    expect(options?.firstId).toBeGreaterThanOrEqual(before)
    expect(String(options?.firstId)).toHaveLength(13)
    controller.abort()
  })
})
