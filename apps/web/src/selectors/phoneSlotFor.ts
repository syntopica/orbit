export const phoneSlotFor = (pathname: string): string => {
  if (pathname === '/') return '/'
  if (pathname === '/memory') return '/memory'
  if (pathname === '/worker' || pathname.startsWith('/worker/'))
    return '/worker'
  if (pathname === '/pending') return '/pending'
  return 'more'
}
