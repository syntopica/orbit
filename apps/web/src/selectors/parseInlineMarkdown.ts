import type { InlineSegment } from '../types/InlineSegment'

// Markdown-lite for one line: backtick spans become code, `**` and `__`
// emphasis markers drop. The result is text for React, never HTML.
export const parseInlineMarkdown = (text: string): InlineSegment[] => {
  const segments: InlineSegment[] = []
  let at = 0
  for (const part of text.split(/(`[^`]+`)/)) {
    const code = part.length > 2 && part.startsWith('`') && part.endsWith('`')
    const shown = code ? part.slice(1, -1) : part.replaceAll(/\*\*|__/g, '')
    if (shown !== '') segments.push({ at, code, text: shown })
    at += part.length
  }
  return segments
}
