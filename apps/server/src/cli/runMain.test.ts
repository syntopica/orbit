import { collectIo } from '../test/collectIo'
import { tempInstance } from '../test/tempInstance'
import { runMain } from './runMain'

describe('runMain', () => {
  it('passes the exit code of the command through', async () => {
    const { io } = collectIo({})
    expect(await runMain(['nope'], io)).toBe(2)
  })

  it('answers a missing SYNTOPICA_DATA with one fixed line', async () => {
    const { io, err, out } = collectIo({})
    expect(await runMain(['token', 'create'], io)).toBe(1)
    expect(err).toEqual([
      'orbit: set SYNTOPICA_DATA to the absolute path of the instance',
    ])
    expect(out).toEqual([])
  })

  it('answers any other failure with a fixed line and no message', async () => {
    const data = await tempInstance()
    const { io, err } = collectIo({
      SYNTOPICA_DATA: `${data}/missing-secret-path`,
    })
    expect(await runMain(['pair'], io)).toBe(1)
    expect(err).toEqual(['orbit: failed'])
  })
})
