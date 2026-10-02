import type { WorkerCooldown } from '@orbit/contract'

export type CooldownSectionProps = {
  readonly cooldowns: readonly WorkerCooldown[]
  readonly now: number
}
