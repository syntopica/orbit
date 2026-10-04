export const trapMoreSheetTab = (
  event: KeyboardEvent,
  dialog: HTMLDialogElement | null,
): void => {
  if (dialog === null) return
  const links = [...dialog.querySelectorAll<HTMLAnchorElement>('a[href]')]
  const first = links.at(0)
  const last = links.at(-1)
  if (first === undefined || last === undefined) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
