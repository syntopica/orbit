export type ConfirmJobActionProps = {
  readonly id: string
  readonly action: 'cancel' | 'retry' | 'ack'
  readonly close: () => void
  readonly confirm: () => Promise<void>
}
