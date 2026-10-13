import type { RefObject } from 'react'

export type MoreSheetProps = {
  readonly onClose: () => void
  readonly trigger: RefObject<HTMLButtonElement | null>
}
