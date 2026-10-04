import type { OrbitConfig } from './OrbitConfig'

export type TodoFile = NonNullable<OrbitConfig['pending']>['todoFiles'][number]
