import type { ClipsView, Snapshot } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIntakeDay } from './isIntakeDay'
import { toCaptureLane } from './toCaptureLane'
import { toCheckRows } from './toCheckRows'
import { toClipsItems } from './toClipsItems'
import { toStateRows } from './toStateRows'

export const toClipsView = (
  { status, doctor }: ClipsDocuments,
  capture: Snapshot | undefined,
  now: number,
): ClipsView => ({
  now,
  total: status.total,
  states: toStateRows(status),
  intake: {
    days: status.intake.days.filter((d) => isIntakeDay(d.day)),
    undated: status.intake.undated,
  },
  doctor: { ok: doctor.ok, checks: toCheckRows(doctor) },
  capture: toCaptureLane(capture),
  items: toClipsItems(status),
})
