import type { CliIo } from '../../types/CliIo'
import { DOCTOR_CHECKS } from '../checks/doctorChecks'
import { openState } from '../openState'

export const doctorCommand = async (
  _args: readonly string[],
  io: CliIo,
): Promise<number> => {
  const state = await openState(io.env).catch(() => null)
  if (state === null) {
    io.out('fail  instance  SYNTOPICA_DATA unreadable or orbit.json invalid')
    return 1
  }
  let failed = false
  for (const check of DOCTOR_CHECKS) {
    const result = await check(state)
    failed ||= result.level === 'fail'
    io.out(`${result.level.padEnd(4)}  ${result.name}  ${result.detail}`)
  }
  state.close()
  return failed ? 1 : 0
}
