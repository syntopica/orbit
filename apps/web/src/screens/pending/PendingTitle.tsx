import { parseInlineMarkdown } from '../../selectors/parseInlineMarkdown'
import type { PendingTitleProps } from '../../types/PendingTitleProps'

export const PendingTitle = ({ text }: PendingTitleProps) => (
  <>
    {parseInlineMarkdown(text).map((segment) =>
      segment.code ? (
        <code key={segment.at} className="font-mono text-[0.92em]">
          {segment.text}
        </code>
      ) : (
        <span key={segment.at}>{segment.text}</span>
      ),
    )}
  </>
)
