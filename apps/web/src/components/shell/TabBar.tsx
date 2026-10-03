import { Link } from '@tanstack/react-router'

import { NAV_ITEMS } from './navItems'

export const TabBar = () => (
  <nav
    aria-label="Tabs"
    className="border-line bg-panel fixed inset-x-0 bottom-0 flex justify-around border-t pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="text-muted min-w-0 flex-1 cursor-pointer truncate px-1 py-3 text-center text-xs"
        activeProps={{ className: 'text-ink', 'aria-current': 'page' }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </Link>
    ))}
  </nav>
)
