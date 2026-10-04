import type { DetailPool } from '../../types/DetailPool'
import type { WorkerQualityReader } from '../../types/WorkerQualityReader'
import { toQualityView } from '../../workerView/toQualityView'
import { getWorkerAggregate } from './getWorkerAggregate'
import { QUALITY_RANGE_DAYS } from './qualityRangeDays'

export const getWorkerQuality = (
  read: WorkerQualityReader | null,
  pool: DetailPool,
  now: () => number,
) =>
  getWorkerAggregate({
    read,
    pool,
    now,
    ranges: QUALITY_RANGE_DAYS,
    convert: toQualityView,
  })
