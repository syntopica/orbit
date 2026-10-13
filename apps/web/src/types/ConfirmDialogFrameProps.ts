import type { ReactNode } from 'react'

export type ConfirmDialogFrameProps = {
  readonly headingId: string
  readonly title: string
  readonly close: () => void
  readonly children: ReactNode
}
