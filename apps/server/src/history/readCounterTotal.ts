import type { DatabaseSync } from 'node:sqlite'

import { readSamplePoints } from './readSamplePoints'

// The growth of a total (delta) or the sum of a per-pass count (sum) since
// `from`. Samples are stored on change, so a steady counter has none inside
// the window and reads 0 from its baseline; never sampled reads null.
export const readCounterTotal = (
  ...[db, component, key, from, mode]: [
    db: DatabaseSync,
    component: string,
    key: string,
    from: number,
    mode: 'delta' | 'sum',
  ]
): number | null => {
  const points = readSamplePoints(db, component, from).filter(
    (point) => point.key === key,
  )
  const first = points[0]
  if (first === undefined || (mode === 'delta' && first.at > from)) return null
  if (mode === 'sum')
    return points
      .filter((point) => point.at >= from)
      .reduce((total, point) => total + point.value, 0)
  return points
    .slice(1)
    .reduce(
      (total, point, i) =>
        total + Math.max(0, point.value - (points[i]?.value ?? point.value)),
      0,
    )
}
