import type { ReactNode } from 'react'

export const ConfirmDialogFrame = ({
  headingId,
  title,
  close,
  children,
}: {
  headingId: string
  title: string
  close: () => void
  children: ReactNode
}) => (
  <div>
    <button
      type="button"
      tabIndex={-1}
      aria-label="Close confirmation"
      onClick={close}
      className="bg-space/70 fixed inset-0 z-40"
    />
    <dialog
      open
      aria-modal="true"
      aria-labelledby={headingId}
      className="border-line bg-panel text-ink fixed inset-x-4 top-1/3 z-50 mx-auto max-w-md space-y-4 rounded-xl border p-5"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>
      {children}
    </dialog>
  </div>
)
