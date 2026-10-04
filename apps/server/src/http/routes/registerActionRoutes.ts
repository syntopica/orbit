import type { Hono } from 'hono'

import { createActionStore } from '../../actions/createActionStore'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { postEngineAction } from './postEngineAction'
import { postLaunchdAction } from './postLaunchdAction'
import { requireActionRate } from './requireActionRate'

export const registerActionRoutes = (
  api: Hono<OrbitEnv>,
  deps: AppDeps,
): void => {
  const store = createActionStore(deps.hub, deps.now)
  deps.actionSignal?.addEventListener(
    'abort',
    () => {
      store.stop()
    },
    { once: true },
  )
  const rate = requireActionRate(deps)
  api.get('/actions', (c) => c.json({ runs: store.list() }))
  api.get('/engines/:engine/actions', (c) => {
    const name = c.req.param('engine')
    const spec =
      name === 'brain' || name === 'clips'
        ? deps.actions?.engines[name]
        : undefined
    return spec === undefined
      ? c.json({ error: 'not_found' }, 404)
      : c.json({ actions: spec.actions })
  })
  api.post('/launchd/:label/run', rate, postLaunchdAction(deps, store, 'run'))
  api.post(
    '/launchd/:label/restart',
    rate,
    postLaunchdAction(deps, store, 'restart'),
  )
  api.post(
    '/engines/:engine/actions/:action',
    rate,
    postEngineAction(deps, store),
  )
}
