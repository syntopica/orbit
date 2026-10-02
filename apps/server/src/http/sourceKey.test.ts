import type { HttpBindings } from '@hono/node-server'
import { Hono } from 'hono'

import { sourceKey } from './sourceKey'

const app = new Hono<{ Bindings: HttpBindings }>()
app.get('/', (c) => c.text(sourceKey(c)))

const keyFor = async (xff?: string, remoteAddress?: string) => {
  const env =
    remoteAddress === undefined
      ? undefined
      : ({ incoming: { socket: { remoteAddress } } } as unknown as HttpBindings)
  const headers: Record<string, string> =
    xff === undefined ? {} : { 'X-Forwarded-For': xff }
  return (await app.request('/', { headers }, env)).text()
}

describe('sourceKey', () => {
  it('uses the last forwarded hop, never the first', async () => {
    expect(await keyFor('6.6.6.6, 100.64.0.7', '127.0.0.1')).toBe('100.64.0.7')
    expect(await keyFor('100.64.0.7')).toBe('100.64.0.7')
  })
  it('falls back to the socket address, then unknown', async () => {
    expect(await keyFor(undefined, '127.0.0.1')).toBe('127.0.0.1')
    expect(await keyFor('', '127.0.0.1')).toBe('127.0.0.1')
    expect(await keyFor('1.1.1.1, ', '127.0.0.1')).toBe('127.0.0.1')
    expect(await keyFor()).toBe('unknown')
  })
})
