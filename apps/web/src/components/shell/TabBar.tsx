import { Link } from '@tanstack/react-router'

import { useTabBar } from '../../hooks/useTabBar'
import { MoreSheet } from './MoreSheet'
import { NavIcon } from './NavIcon'
import { NAV_ITEMS } from './navItems'

export const TabBar = () => {
  const { open, setOpen, trigger, slot } = useTabBar()
  return (
    <>
      <nav
        aria-label="Tabs"
        className="border-line bg-panel fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV_ITEMS.filter((item) =>
          ['/', '/memory', '/worker', '/pending'].includes(item.to),
        ).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: true }}
            aria-current={slot === item.to ? 'page' : undefined}
            className="text-muted aria-[current=page]:text-ink flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px]"
          >
            <NavIcon name={item.to} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-current={slot === 'more' ? 'page' : undefined}
          onClick={() => {
            setOpen(true)
          }}
          className="text-muted aria-[current=page]:text-ink flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px]"
        >
          <NavIcon name="more" />
          <span>More</span>
        </button>
      </nav>
      {open ? (
        <MoreSheet
          onClose={() => {
            setOpen(false)
          }}
          trigger={trigger}
        />
      ) : null}
    </>
  )
}
