import { createRef, useMemo } from 'react'

export const useOrbitLabels = (count: number) =>
  useMemo(
    () => Array.from({ length: count }, () => createRef<HTMLAnchorElement>()),
    [count],
  )
