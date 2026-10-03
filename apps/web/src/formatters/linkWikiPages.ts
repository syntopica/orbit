import type { Root } from 'mdast'
import { transformWikiNodes } from './transformWikiNodes'

// Run after Markdown parsing so code and existing links retain literal text.
export const linkWikiPages = (): ((tree: Root) => void) => transformWikiNodes
