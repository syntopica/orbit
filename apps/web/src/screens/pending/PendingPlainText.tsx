import { Fragment } from 'react'

import { splitUrls } from '../../selectors/splitUrls'
import type { PendingPlainTextProps } from '../../types/PendingPlainTextProps'

// Addresses in a row's detail open in a new tab.
export const PendingPlainText = ({ text }: PendingPlainTextProps) => (
  <>
    {splitUrls(text).map((segment) =>
      segment.url ? (
        <a
          key={segment.at}
          href={segment.text}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          {segment.text}
        </a>
      ) : (
        <Fragment key={segment.at}>{segment.text}</Fragment>
      ),
    )}
  </>
)
