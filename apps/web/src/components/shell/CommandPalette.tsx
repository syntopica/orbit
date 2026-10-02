import { Command } from 'cmdk'

import { trapTab } from '../../handlers/trapTab'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { useFocusOnOpen } from '../../hooks/useFocusOnOpen'
import { PaletteList } from './PaletteList'

// Not Command.Dialog: its Radix modal injects a <style> element to lock
// scrolling, which the strict CSP blocks.
export const CommandPalette = () => {
  const palette = useCommandPalette()
  const input = useFocusOnOpen(palette.open)
  if (!palette.open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close command palette"
        onClick={() => {
          palette.setOpen(false)
        }}
        className="bg-space/60 fixed inset-0 z-40 cursor-default"
      />
      <Command
        label="Command palette"
        onKeyDown={(event) => {
          if (event.key === 'Escape') palette.setOpen(false)
          trapTab(event)
        }}
        className="border-line bg-panel fixed inset-x-4 top-24 z-50 mx-auto max-w-lg rounded-2xl border p-2 shadow-2xl"
      >
        <Command.Input
          ref={input}
          placeholder="Go to…"
          className="w-full bg-transparent px-3 py-2 outline-none"
        />
        <PaletteList palette={palette} />
      </Command>
    </div>
  )
}
