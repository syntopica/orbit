import type { Handler } from 'hono'

import type { ActionStore } from '../../types/ActionStore'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { actionStartResponse } from './actionStartResponse'
import { getConfiguredEngineAction } from './getConfiguredEngineAction'

export const postEngineAction =
  (deps: AppDeps, store: ActionStore): Handler<OrbitEnv, string> =>
  (c) => {
    const engine = c.req.param('engine') ?? ''
    const action = c.req.param('action') ?? ''
    const configured = getConfiguredEngineAction(deps.actions, engine, action)
    if (configured === null) return c.json({ error: 'not_found' }, 404)
    const result = store.start({
      kind: action,
      target: engine,
      key: `engine:${engine}:${action}`,
      component: configured.name,
      run: async (signal) =>
        await configured.runner(
          configured.spec.args,
          signal,
          configured.spec.timeoutS * 1000,
        ),
    })
    return actionStartResponse(c, result)
  }
