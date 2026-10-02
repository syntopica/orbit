import { z } from 'zod'

import { buildChildEnv } from '../../process/buildChildEnv'
import { ProcessError } from '../../process/ProcessError'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import type { LaunchdSchedule } from '../../types/LaunchdSchedule'
import { calendarPeriodS } from './calendarPeriodS'
import { positiveInterval } from './positiveInterval'

export const readSchedule = async (
  deps: LaunchdAdapterDeps,
  plist: string,
  signal: AbortSignal,
): Promise<LaunchdSchedule> => {
  const result = await deps.run({
    file: deps.plutil,
    args: ['-convert', 'json', '-o', '-', plist],
    env: buildChildEnv(process.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
    signal,
  })
  if (result.code !== 0) throw new ProcessError('not_found')
  const parsed = z
    .object({
      StartInterval: z.unknown().optional(),
      StartCalendarInterval: z.unknown().optional(),
      KeepAlive: z.unknown().optional(),
    })
    .parse(JSON.parse(result.stdout))
  const period = calendarPeriodS(parsed.StartCalendarInterval)
  return {
    intervalS: positiveInterval(parsed.StartInterval) ?? period,
    calendar: period !== null,
    keepAlive: parsed.KeepAlive !== undefined && parsed.KeepAlive !== false,
  }
}
