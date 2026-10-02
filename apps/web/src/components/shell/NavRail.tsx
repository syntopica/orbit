import { Link } from '@tanstack/react-router'

import { ConnectionIndicator } from './ConnectionIndicator'
import { NAV_ITEMS } from './navItems'

export const NavRail = () => (
  <nav
    aria-label="Primary"
    className="border-line hidden h-dvh flex-col gap-2 border-r p-3 md:sticky md:top-0 md:flex"
  >
    <span className="text-accent mb-4 font-mono text-sm">orbit</span>
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="text-muted hover:text-ink rounded-lg px-2 py-1.5 text-sm"
        activeProps={{ className: 'bg-panel text-ink', 'aria-current': 'page' }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </Link>
    ))}
    <div className="mt-auto">
      <ConnectionIndicator />
    </div>
  </nav>
)
