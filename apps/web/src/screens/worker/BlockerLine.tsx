import { formatBlocker } from '../../formatters/formatBlocker'
import type { BlockerLineProps } from '../../types/BlockerLineProps'

// Worker names and codes are data: verbatim, in monospace.
export const BlockerLine = ({ blocker }: BlockerLineProps) => (
  <li>
    {blocker.subject !== null && (
      <code className="font-mono">{blocker.subject}</code>
    )}{' '}
    {formatBlocker(blocker)}
    {blocker.code !== null && (
      <>
        {' '}
        <code className="font-mono">{blocker.code}</code>
      </>
    )}
  </li>
)
