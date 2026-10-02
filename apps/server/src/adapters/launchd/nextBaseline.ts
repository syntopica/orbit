import type { LabelReading } from '../../types/LabelReading'

export const nextBaseline = (
  previous: ReadonlyMap<string, LabelReading>,
  readings: readonly LabelReading[],
): Map<string, LabelReading> =>
  new Map(
    readings.flatMap((r): [string, LabelReading][] => {
      const kept = r.error === null ? r : previous.get(r.entry.label)
      return kept === undefined ? [] : [[r.entry.label, kept]]
    }),
  )
