import { orbitConfigSchema } from './orbitConfigSchema'

describe('pending config', () => {
  it('defaults to no TODO sources and validates names, paths and count', () => {
    expect(orbitConfigSchema.parse({}).pending).toBeUndefined()
    expect(
      orbitConfigSchema.safeParse({
        pending: { todoFiles: [{ name: 'tasks', path: '/tmp/TODO.md' }] },
      }).success,
    ).toBe(true)
    expect(
      orbitConfigSchema.safeParse({
        pending: { todoFiles: [{ name: 'bad name', path: '/tmp/TODO.md' }] },
      }).success,
    ).toBe(false)
    expect(
      orbitConfigSchema.safeParse({
        pending: { todoFiles: [{ name: 'tasks', path: 'TODO.md' }] },
      }).success,
    ).toBe(false)
    expect(
      orbitConfigSchema.safeParse({
        pending: {
          todoFiles: Array(51).fill({ name: 'tasks', path: '/tmp/TODO.md' }),
        },
      }).success,
    ).toBe(false)
    expect(
      orbitConfigSchema.safeParse({
        pending: {
          todoFiles: [
            { name: 'tasks', path: '/tmp/a' },
            { name: 'tasks', path: '/tmp/b' },
          ],
        },
      }).success,
    ).toBe(false)
  })
})
