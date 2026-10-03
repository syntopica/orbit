import { Command } from 'cmdk'

import { usePalettePages } from '../../hooks/usePalettePages'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PalettePagesProps } from '../../types/PalettePagesProps'

export const PalettePages = ({ palette }: PalettePagesProps) => {
  const { ids } = usePalettePages(palette.open)
  if (ids.length === 0) return null
  return (
    <Command.Group heading={BRAIN_LABELS.palettePages}>
      {ids.map((id) => (
        <Command.Item
          key={id}
          value={id}
          onSelect={() => {
            palette.openPage(id)
          }}
          className="aria-selected:bg-space rounded-lg px-3 py-2 font-mono text-sm"
        >
          {id}
        </Command.Item>
      ))}
    </Command.Group>
  )
}
