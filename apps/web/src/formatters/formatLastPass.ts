import type { AtriumView } from '@orbit/contract'

import { formatCount } from './formatCount'
import { formatDuration } from './formatDuration'

// "3 synthesized · 1 deferred · 0 failed · 0 skipped of 4, 15m ago, took 5m"
export const formatLastPass = (
  pass: NonNullable<AtriumView['synthesis']>,
  now: number,
): string =>
  [
    `${formatCount(pass.synthesized)} synthesized`,
    `${formatCount(pass.deferred)} deferred`,
    `${formatCount(pass.failed)} failed`,
    `${formatCount(pass.skipped)} skipped of ${formatCount(pass.conversations)}`,
  ].join(' · ') +
  `, ${formatDuration(now - pass.finishedAt)} ago, took ${formatDuration(pass.durationMs)}`
