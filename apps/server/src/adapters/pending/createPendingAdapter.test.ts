import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createPendingAdapter } from './createPendingAdapter'

describe('createPendingAdapter', () => {
  it('publishes only TODO counts and no item content', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-pending-'))
    const path = join(dir, 'TODO.md')
    await writeFile(
      path,
      '- [!] Private placeholder\n- [~] Another placeholder',
    )
    const adapter = createPendingAdapter([{ name: 'tasks', path }], 1000)
    const snapshot = await adapter.read(new AbortController().signal)
    expect([adapter.id, adapter.cadenceMs, adapter.freshnessMs]).toEqual([
      'pending',
      1000,
      2000,
    ])
    expect(snapshot.pending.map((row) => row.count)).toEqual([1, 1])
    expect(JSON.stringify(snapshot)).not.toContain('Private placeholder')
    expect(JSON.stringify(snapshot)).not.toContain(path)
  })
  it('warns backlog once blocked items pass the configured limit', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-pending-'))
    const path = join(dir, 'TODO.md')
    await writeFile(path, '- [!] one\n- [!] two')
    const read = async (limit?: number) =>
      (
        await createPendingAdapter([{ name: 'tasks', path }], 1000, limit).read(
          new AbortController().signal,
        )
      ).health
    expect(await read(1)).toEqual({ state: 'warn', reason: 'backlog' })
    expect(await read(2)).toEqual({ state: 'ok', reason: null })
    expect(await read()).toEqual({ state: 'ok', reason: null })
  })
})
