import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { linkWikiPages } from '../../formatters/linkWikiPages'
import type { PageMarkdownProps } from '../../types/PageMarkdownProps'
import { markdownComponents } from './markdownComponents'

// No rehype-raw: HTML in a page is never rendered as HTML (spec 6.6).
export const PageMarkdown = ({ body, search }: PageMarkdownProps) => {
  const components = markdownComponents(search)
  return (
    <article className="min-w-0 space-y-3 text-sm leading-relaxed wrap-break-word [&_a]:underline [&_code]:font-mono [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5">
      <Markdown
        remarkPlugins={[remarkGfm, linkWikiPages]}
        components={components}
      >
        {body}
      </Markdown>
    </article>
  )
}
