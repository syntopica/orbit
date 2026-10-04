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
      <div className="min-w-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] md:p-8">
        <Outlet />
      </div>
      <TabBar />
      <Toasts />
      <CommandPalette />
    </div>
  </StreamProvider>
)
