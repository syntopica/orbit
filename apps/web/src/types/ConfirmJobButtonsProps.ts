import type { RefObject } from 'react'
import type { useConfirmJobAction } from '../hooks/useConfirmJobAction'

export type ConfirmJobButtonsProps = {
  readonly model: ReturnType<typeof useConfirmJobAction>
  readonly cancelRef: RefObject<HTMLButtonElement | null>
  readonly close: () => void
  readonly action: string
}
