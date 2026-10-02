import type { SubmitEvent } from 'react'

import type { LoginStatus } from './LoginStatus'

export type LoginModel = {
  readonly token: string
  readonly status: LoginStatus
  readonly setToken: (token: string) => void
  readonly submit: (event: SubmitEvent<HTMLFormElement>) => void
}
