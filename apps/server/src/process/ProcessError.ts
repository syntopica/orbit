import type { ReasonCode } from '@orbit/contract'

export class ProcessError extends Error {
  readonly reason: ReasonCode

  constructor(reason: ReasonCode) {
    super(reason)
    this.name = 'ProcessError'
    this.reason = reason
  }
}
