import type { Handler } from 'hono'

import { ORBIT_LAUNCHD_LABEL } from '../../launchd/orbitLaunchdLabel'
import { buildChildEnv } from '../../process/buildChildEnv'
import type { ActionStore } from '../../types/ActionStore'
import type { AppDeps } from '../../types/AppDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { actionStartResponse } from './actionStartResponse'

export const postLaunchdAction =
  (
    deps: AppDeps,
    store: ActionStore,
    action: 'run' | 'restart',
  ): Handler<OrbitEnv, string> =>
  (c) => {
    const actions = deps.actions
    const config = actions?.launchd
    const label = c.req.param('label') ?? ''
    const entry = config?.labels.find((item) => item.label === label)
    if (
      actions === undefined ||
      config === undefined ||
      entry === undefined ||
      !entry.actions.includes(action)
    )
      return c.json({ error: 'not_found' }, 404)
    if (action === 'restart' && label === ORBIT_LAUNCHD_LABEL)
      return c.json({ error: 'self' }, 400)
    const result = store.start({
      kind: action,
      target: label,
      key: `launchd:${label}`,
      component: 'launchd',
      run: async (signal) =>
        await actions.run({
          file: config.launchctl,
          args: [
            'kickstart',
            ...(action === 'restart' ? ['-k'] : []),
            `gui/${String(actions.uid)}/${label}`,
          ],
          env: buildChildEnv(actions.env, {}),
          timeoutMs: 10_000,
          maxBytes: 8 * 1024 * 1024,
          signal,
        }),
    })
    return actionStartResponse(c, result)
  }
