import { Command } from 'cmdk'

import type { PaletteListProps } from '../../types/PaletteListProps'
import { NAV_ITEMS } from './navItems'
import { PalettePages } from './PalettePages'

export const PaletteList = ({ palette }: PaletteListProps) => (
  <Command.List className="max-h-[calc(100dvh-11rem)] overflow-y-auto">
    <Command.Empty className="text-muted px-3 py-2 text-sm">
      Nothing matches
    </Command.Empty>
    <Command.Group heading="Go to">
      {NAV_ITEMS.map((item) => (
        <Command.Item
          key={item.to}
          onSelect={() => {
            palette.go(item.to)
          }}
          className="aria-selected:bg-space rounded-lg px-3 py-2"
        >
          {item.label}
        </Command.Item>
      ))}
    </Command.Group>
    <PalettePages palette={palette} />
    <Command.Group heading="Session">
      <Command.Item
        onSelect={palette.signOut}
        className="aria-selected:bg-space rounded-lg px-3 py-2"
      >
        Sign out
      </Command.Item>
    </Command.Group>
  </Command.List>
)
