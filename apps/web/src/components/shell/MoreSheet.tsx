import type { RefObject } from 'react'

import { useMoreSheetFocus } from '../../hooks/useMoreSheetFocus'
import { useMoreSheetKeyboard } from '../../hooks/useMoreSheetKeyboard'
import { MoreSheetLinks } from './MoreSheetLinks'

export const MoreSheet = ({
  onClose,
  trigger,
}: {
  onClose: () => void
  trigger: RefObject<HTMLButtonElement | null>
}) => {
  const first = useMoreSheetFocus(trigger)
  const dialog = useMoreSheetKeyboard(onClose)
  return (
    <dialog
      ref={dialog}
      open
      aria-modal="true"
      aria-label="More screens"
      className="text-ink fixed inset-0 z-40 m-0 h-dvh w-full max-w-none border-0 bg-transparent p-0"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close more screens"
        onClick={onClose}
        className="bg-space/70 fixed inset-0 z-40 cursor-default"
      />
      <div className="border-line bg-panel fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
        <h2 className="mb-2 font-semibold">More screens</h2>
        <MoreSheetLinks first={first} onClose={onClose} />
      </div>
    </dialog>
  )
}
