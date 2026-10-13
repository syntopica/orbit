import type { StepUpPrompt } from './StepUpPrompt'

export type ActionConfirmDialogProps = {
  readonly target: string
  readonly action: string
  readonly close: () => void
  readonly confirm: () => Promise<void>
  readonly error: boolean
  readonly sending: boolean
  readonly stepUp: StepUpPrompt
}
