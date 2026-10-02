export type CheckResult = {
  readonly name: string
  readonly level: 'ok' | 'warn' | 'fail'
  readonly detail: string
}
