import { Link } from '@tanstack/react-router'

import { withPage } from '../../selectors/withPage'
import type { PageLinkProps } from '../../types/PageLinkProps'

// A page id that selects that page, keeping the rest of the view.
export const PageLink = ({ id, search }: PageLinkProps) => (
  <Link
    to="/brain"
    search={withPage(search, id)}
    className="font-mono underline"
  >
    {id}
  </Link>
)
