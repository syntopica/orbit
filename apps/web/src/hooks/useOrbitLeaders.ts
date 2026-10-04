import { createRef, useMemo } from 'react'

export const useOrbitLeaders = (count: number) =>
  useMemo(
    () => Array.from({ length: count }, () => createRef<SVGPathElement>()),
    [count],
  )
