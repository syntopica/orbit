import type { WorkerNode } from '@orbit/contract'

export const isNodeOnBattery = (node: WorkerNode): boolean =>
  node.onAc === false || node.reason === 'on_battery'
