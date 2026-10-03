import type { Parent, RootContent } from 'mdast'
import { wikiTextNodes } from './wikiTextNodes'

export const transformWikiNodes = (parent: Parent): void => {
  parent.children = parent.children.flatMap((node): RootContent[] => {
    if (node.type === 'text') return wikiTextNodes(node.value)
    if (
      node.type !== 'link' &&
      node.type !== 'linkReference' &&
      'children' in node
    ) {
      transformWikiNodes(node)
    }
    return [node]
  })
}
