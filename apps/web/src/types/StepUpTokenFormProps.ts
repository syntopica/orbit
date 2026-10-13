import type { StepUpPrompt } from './StepUpPrompt'

export type StepUpTokenFormProps = {
  readonly model: StepUpPrompt
  readonly inputLabel: string
  readonly submitLabel: string
  readonly onAccepted?: () => void
}
