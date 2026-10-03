import type { MetricHistory } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

import { groupSeries } from './groupSeries'
import { RAW_RETENTION_MS } from './rawRetentionMs'
import { readRollupPoints } from './readRollupPoints'
import { readRunIntervals } from './readRunIntervals'
import { readSamplePoints } from './readSamplePoints'

// Raw samples where they are kept, hourly rollups before that (spec 7.4).
export const readMetricHistory = (
  db: DatabaseSync,
  component: string,
  from: number,
  now: number,
): Pick<MetricHistory, 'runs' | 'series'> => {
  const cutoff = now - RAW_RETENTION_MS
  const rawFrom = Math.max(from, cutoff)
  return {
    runs: readRunIntervals(db, from),
    series: groupSeries(
      [
        ...readRollupPoints(db, component, from, cutoff),
        ...readSamplePoints(db, component, rawFrom),
      ],
      from,
    ),
  }
}
