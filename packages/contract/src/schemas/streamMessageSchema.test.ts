import { streamMessageSchema } from './streamMessageSchema'

describe('streamMessageSchema', () => {
  it('accepts sync and resync markers', () => {
    expect(streamMessageSchema.parse({ type: 'sync', id: 4 }).type).toBe('sync')
    expect(streamMessageSchema.parse({ type: 'resync', id: 0 }).type).toBe(
      'resync',
    )
  })
  it('rejects a negative id', () => {
    expect(() => streamMessageSchema.parse({ type: 'sync', id: -1 })).toThrow()
  })
  it('rejects an unknown type', () => {
    expect(() => streamMessageSchema.parse({ type: 'page', id: 1 })).toThrow()
  })
})
