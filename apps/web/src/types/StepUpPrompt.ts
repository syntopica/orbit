import type { SubmitEvent } from 'react'

export type StepUpPrompt = {
  readonly token: string
  readonly setToken: (token: string) => void
  readonly stepError: boolean
  readonly prompt: boolean
  readonly submit: (
    event: SubmitEvent<HTMLFormElement>,
    accepted?: () => void,
  ) => void
  readonly openPrompt: () => void
  readonly cancelPrompt: () => void
}
