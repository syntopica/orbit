import { resolveEngines } from '../../engines/resolveEngines'
import { runProcess } from '../../process/runProcess'
import { reasonOf } from '../../scheduler/reasonOf'
import type { DoctorCheck } from '../../types/DoctorCheck'
import { runEngineCommands } from './runEngineCommands'

// Runs every listed engine subcommand once, as the server would (spec 10).
export const checkEngines: DoctorCheck = async (state) => {
  const name = 'engines'
  const table = state.config.engines
  const configured = Object.keys(table)
  if (configured.length === 0) {
    return { name, level: 'ok', detail: 'not configured' }
  }
  const { runners, failed } = await resolveEngines(
    table,
    state.instance.engines,
    runProcess,
  )
  const [missing] = failed
  if (missing !== undefined) {
    return { name, level: 'fail', detail: `${missing} not_found` }
  }
  let ran = 0
  for (const [engine, spec] of Object.entries(table)) {
    try {
      ran += await runEngineCommands(runners[engine], spec.subcommands)
    } catch (error) {
      return { name, level: 'fail', detail: `${engine} ${reasonOf(error)}` }
    }
  }
  return { name, level: 'ok', detail: `${String(ran)} engine commands ran` }
}
