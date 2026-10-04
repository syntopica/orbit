import type { WorkerCooldown } from '@orbit/contract'

export type ExecutorsSectionProps = {
  readonly cooldowns: readonly WorkerCooldown[]
  readonly now: number
  readonly isPhone: boolean
}
