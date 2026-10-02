import { openTestState } from '../../test/openTestState'
import { checkTailnet } from './checkTailnet'

const levelFor = async (orbit: Record<string, unknown>): Promise<string> => {
  const state = await openTestState(orbit)
  const result = await checkTailnet(state)
  state.close()
  return result.level
}

describe('checkTailnet', () => {
  it('warns when only local access is configured', async () => {
    expect(await levelFor({})).toBe('warn')
  })

  it('fails when hosts are set without allowed logins', async () => {
    expect(await levelFor({ allowedHosts: ['orbit.example.ts.net'] })).toBe(
      'fail',
    )
  })

  it('passes with hosts and logins', async () => {
    expect(
      await levelFor({
        allowedHosts: ['orbit.example.ts.net'],
        allowedLogins: ['user@example.com'],
      }),
    ).toBe('ok')
  })
})
