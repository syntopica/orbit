import type { Hono } from 'hono'

import { toBrainChecks } from '../../brainView/toBrainChecks'
import { toBrainGraph } from '../../brainView/toBrainGraph'
import { toBrainRelated } from '../../brainView/toBrainRelated'
import type { BrainReaders } from '../../types/BrainReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { getBrainDetail } from './getBrainDetail'
import { getBrainPage } from './getBrainPage'

// Spec 7.5: the graph and related pairs (one command, 10 s each) a page (10 s), and the
// checks (lint then doctor, 15 s), all under the memory detail pool.
export const registerBrainRoutes = (
  api: Hono<OrbitEnv>,
  brain: BrainReaders | null,
  pool: DetailPool,
  now: () => number,
): void => {
  api.get(
    '/brain/graph',
    getBrainDetail(brain?.graph ?? null, toBrainGraph, pool, now, 10_000),
  )
  api.get(
    '/brain/related',
    getBrainDetail(brain?.related ?? null, toBrainRelated, pool, now, 10_000),
  )
  api.get(
    '/brain/checks',
    getBrainDetail(brain?.checks ?? null, toBrainChecks, pool, now, 15_000),
  )
  api.get('/brain/page', getBrainPage(brain?.page ?? null, pool))
}
