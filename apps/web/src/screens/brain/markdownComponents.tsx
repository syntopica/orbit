import { Link } from '@tanstack/react-router'
import type { Components } from 'react-markdown'

import { internalPageOf } from '../../formatters/internalPageOf'
import { withPage } from '../../selectors/withPage'
import type { BrainSearch } from '../../types/BrainSearch'

// Spec 6.6: in-screen links select pages; other links open a new tab without
// an opener or referrer; images show their alt text (the CSP would block a
// remote image anyway). Page headings sit below the panel's own heading.
export const markdownComponents = (search: BrainSearch): Components => ({
  a: ({ href, children }) => {
    const id = internalPageOf(href)
    return id === null ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <Link to="/brain" search={withPage(search, id)}>
        {children}
      </Link>
    )
  },
  img: ({ alt }) => <span className="text-muted italic">{alt}</span>,
  table: ({ children }) => (
    <div
      role="region"
      aria-label="Page content table"
      tabIndex={0}
      className="max-w-full overflow-x-auto"
    >
      <table className="min-w-max">{children}</table>
    </div>
  ),
  h1: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
  h2: ({ children }) => <h4 className="font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="font-semibold">{children}</h5>,
  h4: ({ children }) => <h6 className="font-semibold">{children}</h6>,
  h5: ({ children }) => <h6 className="font-semibold">{children}</h6>,
  h6: ({ children }) => <h6 className="font-semibold">{children}</h6>,
})
