import type { NavItem } from './NavItem'

export type CommandPaletteModel = {
  readonly open: boolean
  readonly setOpen: (open: boolean) => void
  readonly go: (to: NavItem['to']) => void
  readonly openPage: (id: string) => void
  readonly signOut: () => void
}
