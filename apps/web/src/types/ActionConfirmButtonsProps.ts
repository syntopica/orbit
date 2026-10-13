export type ActionConfirmButtonsProps = {
  readonly action: string
  readonly close: () => void
  readonly confirm: () => Promise<void>
  readonly sending: boolean
}
