import { Link } from '@tanstack/react-router'
import type { RefObject } from 'react'

import { NavIcon } from './NavIcon'
import { NAV_ITEMS } from './navItems'

export const MoreSheetLinks = ({
  first,
  onClose,
}: {
  first: RefObject<HTMLAnchorElement | null>
  onClose: () => void
}) => (
  <>
    {NAV_ITEMS.filter((item) =>
      ['/atrium', '/brain', '/clips', '/system'].includes(item.to),
    ).map((item, index) => (
      <Link
        key={item.to}
        ref={index === 0 ? first : undefined}
        to={item.to}
        onClick={onClose}
        className="text-muted hover:text-ink flex min-h-11 items-center gap-3 rounded-lg px-3"
        activeProps={{ className: 'bg-space text-ink', 'aria-current': 'page' }}
      >
        <NavIcon name={item.to} />
        {item.label}
      </Link>
    ))}
  </>
)
