import type { AtriumView } from '@orbit/contract'

import { formatDuration } from './formatDuration'

// When the refresh job last published its doctor result, and whether that is
// past twice the refresh interval.
export const formatDoctorNote = (
  doctor: NonNullable<AtriumView['doctor']>,
  now: number,
): string =>
  `Published ${formatDuration(now - doctor.writtenAt)} ago${doctor.stale ? ', stale.' : '.'}`
