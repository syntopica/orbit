import { eventSchema } from './eventSchema'

const base = {
  at: '2026-10-02T10:00:00.000Z',
  component: 'launchd',
  kind: 'launchd.exit_changed',
  severity: 'warn',
  refs: { label: 'com.example.job', exit: 78 },
}

describe('eventSchema', () => {
  it('accepts opaque refs', () => {
    expect(eventSchema.parse(base)).toEqual(base)
  })
  it('rejects a path-shaped ref', () => {
    expect(() =>
      eventSchema.parse({ ...base, refs: { page: 'topics/secret-plan' } }),
    ).toThrow()
  })
  it('rejects a ref longer than 64 characters', () => {
    expect(() =>
      eventSchema.parse({ ...base, refs: { id: 'a'.repeat(65) } }),
    ).toThrow()
  })
  it('rejects an unknown kind', () => {
    expect(() => eventSchema.parse({ ...base, kind: 'free.text' })).toThrow()
  })
  it('rejects unknown fields', () => {
    expect(() => eventSchema.parse({ ...base, summary: 'text' })).toThrow()
  })
})
