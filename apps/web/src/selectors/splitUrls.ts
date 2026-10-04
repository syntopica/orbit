import type { UrlSegment } from '../types/UrlSegment'

// Splits plain text around http(s) addresses so they render as links; a
// trailing sentence mark stays text.
export const splitUrls = (text: string): UrlSegment[] => {
  const segments: UrlSegment[] = []
  let at = 0
  text
    .split(/(https?:\/\/[^\s<>"'`]*[^\s<>"'`.,;:!?)])/)
    .forEach((part, index) => {
      if (part !== '') segments.push({ at, text: part, url: index % 2 === 1 })
      at += part.length
    })
  return segments
}
