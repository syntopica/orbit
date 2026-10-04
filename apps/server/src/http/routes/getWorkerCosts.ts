import type { DetailPool } from '../../types/DetailPool'
import type { WorkerCostsReader } from '../../types/WorkerCostsReader'
import { toCostsView } from '../../workerView/toCostsView'
import { COSTS_RANGE_DAYS } from './costsRangeDays'
import { getWorkerAggregate } from './getWorkerAggregate'

export const getWorkerCosts = (
  read: WorkerCostsReader | null,
  pool: DetailPool,
  now: () => number,
) =>
  getWorkerAggregate({
    read,
    pool,
    now,
    ranges: COSTS_RANGE_DAYS,
    convert: toCostsView,
  })
