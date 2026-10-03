import { dirname } from 'node:path'

import { openTestState } from '../../test/openTestState'
import { writeFakeBin } from '../../test/writeFakeBin'
import { checkEngines } from './checkEngines'

const withTool = async (body: string) => {
  const bin = await writeFakeBin('tool', body)
  const state = await openTestState({
    engines: { brain: { command: 'tool', subcommands: [['lint', '--json']] } },
  })
  const path = dirname(bin)
  return {
    ...state,
    instance: { ...state.instance, engines: { brain: { path } } },
  }
}

describe('checkEngines', () => {
  it('is ok when no engine is configured', async () => {
    const state = await openTestState()
    expect(await checkEngines(state)).toMatchObject({
      level: 'ok',
      detail: 'not configured',
    })
    state.close()
  })
  it('runs every listed subcommand once', async () => {
    const state = await withTool(`echo '{"schemaVersion":1}'`)
    expect(await checkEngines(state)).toMatchObject({
      level: 'ok',
      detail: '1 engine commands ran',
    })
    state.close()
  })
  it('fails when the tool is not executable', async () => {
    const state = await openTestState({
      engines: { brain: { command: 'tool', subcommands: [['lint']] } },
    })
    const path = dirname(await writeFakeBin('x', ''))
    const broken = {
      ...state,
      instance: { ...state.instance, engines: { brain: { path } } },
    }
    expect(await checkEngines(broken)).toMatchObject({
      level: 'fail',
      detail: 'brain not_found',
    })
    state.close()
  })
  it('accepts a valid document whatever the exit code', async () => {
    const state = await withTool(`echo '{"schemaVersion":1}'; exit 2`)
    expect((await checkEngines(state)).level).toBe('ok')
    state.close()
  })
  it('fails on unparseable output with a non-zero exit', async () => {
    const state = await withTool('echo nope; exit 64')
    expect(await checkEngines(state)).toMatchObject({
      level: 'fail',
      detail: 'brain exit_nonzero',
    })
    state.close()
  })
})
