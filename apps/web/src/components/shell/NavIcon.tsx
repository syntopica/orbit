import type { NavItem } from '../../types/NavItem'

export const NavIcon = ({ name }: { name: NavItem['to'] | 'more' }) => {
  const paths: Record<NavItem['to'] | 'more', string> = {
    '/': 'M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3 6 3.3v7.4L12 19l-6-3.3V8.3L12 5Z',
    '/memory':
      'M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4Zm16 0h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6V4Z',
    '/atrium': 'M3 20V8l9-5 9 5v12H3Zm3-2h4v-6h4v6h4V9l-6-3-6 3v9Z',
    '/brain':
      'M12 3a4 4 0 0 0-4 4 4 4 0 0 0-3 6 4 4 0 0 0 4 7h3V3Zm1 0v17h2a4 4 0 0 0 4-7 4 4 0 0 0-3-6 4 4 0 0 0-3-4Z',
    '/clips': 'M4 3h16v3H4V3Zm2 5h12v3H6V8Zm2 5h8v8H8v-8Z',
    '/worker': 'M4 4h16v13H4V4Zm2 2v9h12V6H6Zm2 13h8v2H8v-2Z',
    '/pending': 'M5 3h14v18H5V3Zm3 4v2h8V7H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z',
    '/system': 'M4 5h16v3H4V5Zm0 6h16v3H4v-3Zm0 6h16v3H4v-3Z',
    more: 'M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  }
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path d={paths[name]} />
    </svg>
  )
}
