import { useCallback, useEffect, useState } from 'react'

// The chart's own width, read when its box mounts and on every resize with
// no timer in between, so a capture or a slow tab never keeps a stale size.
// Before the first read it is 640 px; the SVG scales to its box meanwhile.
export const useChartWidth = () => {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(640)
  const parentRef = useCallback((element: HTMLDivElement | null) => {
    setNode(element)
    if (element && element.clientWidth > 0) setWidth(element.clientWidth)
  }, [])
  useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => {
      if (node.clientWidth > 0) setWidth(node.clientWidth)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [node])
  return { parentRef, width }
}
