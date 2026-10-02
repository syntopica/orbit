import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { openTestState } from '../../test/openTestState'
import { checkLaunchdLabels } from './checkLaunchdLabels'

const label = (plist: string) => ({
  component: 'worker',
  label: 'com.example.job',
  role: 'scheduled',
  plist,
})

describe('checkLaunchdLabels', () => {
  it('passes with no labels', async () => {
    const state = await openTestState()
    expect((await checkLaunchdLabels(state)).level).toBe('ok')
    state.close()
  })

  it('fails naming a label whose plist is missing', async () => {
    const state = await openTestState({
      launchd: { labels: [label('/nonexistent/job.plist')] },
    })
    expect(await checkLaunchdLabels(state)).toMatchObject({
      level: 'fail',
      detail: 'plist missing for com.example.job',
    })
    state.close()
  })

  it('passes when every plist exists', async () => {
    const probe = await openTestState()
    const plist = join(probe.dataDir, 'job.plist')
    await writeFile(plist, '')
    probe.close()
    const state = await openTestState({ launchd: { labels: [label(plist)] } })
    expect((await checkLaunchdLabels(state)).level).toBe('ok')
    state.close()
  })
})
