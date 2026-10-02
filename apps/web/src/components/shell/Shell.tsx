import { Outlet } from '@tanstack/react-router'

import { StreamProvider } from '../../stream/StreamProvider'
import { CommandPalette } from './CommandPalette'
import { NavRail } from './NavRail'
import { TabBar } from './TabBar'
import { Toasts } from './Toasts'

export const Shell = () => (
  <StreamProvider>
    <div className="min-h-dvh md:grid md:grid-cols-[9rem_1fr]">
      <NavRail />
      <div className="p-4 pb-24 md:p-8">
        <Outlet />
      </div>
      <TabBar />
      <Toasts />
      <CommandPalette />
    </div>
  </StreamProvider>
)
