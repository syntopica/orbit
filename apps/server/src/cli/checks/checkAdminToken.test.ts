import { createAdminToken } from '../../auth/createAdminToken'
import { openTestState } from '../../test/openTestState'
import { checkAdminToken } from './checkAdminToken'

describe('checkAdminToken', () => {
  it('fails without a token and passes with one', async () => {
    const state = await openTestState()
    expect((await checkAdminToken(state)).level).toBe('fail')
    createAdminToken(state.authDb, Date.now())
    expect(await checkAdminToken(state)).toMatchObject({
      level: 'ok',
      detail: 'present',
    })
    state.close()
  })
})
