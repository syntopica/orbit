import { pageIdSchema } from '@orbit/contract'
import type { Link, Text } from 'mdast'

export const wikiTextNodes = (value: string): (Link | Text)[] => {
  const nodes: (Link | Text)[] = []
  let offset = 0
  for (const match of value.matchAll(/\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g)) {
    const target = match[1] ?? ''
    if (match.index > offset)
      nodes.push({ type: 'text', value: value.slice(offset, match.index) })
    const label: Text = { type: 'text', value: match[2] ?? target }
    nodes.push(
      pageIdSchema.safeParse(target).success
        ? {
            type: 'link',
            url: `/brain?page=${encodeURIComponent(target)}`,
            children: [label],
          }
        : label,
    )
    offset = match.index + match[0].length
  }
  if (offset < value.length)
    nodes.push({ type: 'text', value: value.slice(offset) })
  return nodes
}
