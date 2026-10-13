import type { RefObject } from 'react'

export type MoreSheetLinksProps = {
  readonly first: RefObject<HTMLAnchorElement | null>
  readonly onClose: () => void
}
