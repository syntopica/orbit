import type { AppDeps } from './AppDeps'

export type FlowRouteDeps = Pick<
  AppDeps,
  'hub' | 'historyDb' | 'atrium' | 'stageLabels' | 'now'
>
