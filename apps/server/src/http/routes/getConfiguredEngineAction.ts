import { z } from 'zod'

import type { ActionDeps } from '../../types/ActionDeps'

export const getConfiguredEngineAction = (
  deps: ActionDeps | undefined,
  engine: string,
  action: string,
) => {
  const name = z.enum(['brain', 'clips']).safeParse(engine)
  if (!name.success || deps === undefined) return null
  const spec = deps.engines[name.data]?.actions[action]
  const runner = deps.runners[name.data]
  return spec === undefined || runner === undefined
    ? null
    : { name: name.data, spec, runner }
}
