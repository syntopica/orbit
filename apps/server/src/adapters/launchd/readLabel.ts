import { buildChildEnv } from '../../process/buildChildEnv'
import type { LabelEntry } from '../../types/LabelEntry'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { parseLaunchctlPrint } from './parseLaunchctlPrint'

export const readLabel = async (
  deps: LaunchdAdapterDeps,
  entry: LabelEntry,
  signal: AbortSignal,
): Promise<LabelReading> => {
  const result = await deps.run({
    file: deps.launchctl,
    args: ['print', `gui/${String(deps.uid)}/${entry.label}`],
    env: buildChildEnv(process.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
    signal,
  })
  if (result.code !== 0) return { entry, loaded: false, state: null }
  return { entry, loaded: true, state: parseLaunchctlPrint(result.stdout) }
}
