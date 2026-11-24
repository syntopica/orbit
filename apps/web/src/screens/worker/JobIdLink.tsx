import { Link } from '@tanstack/react-router'

import type { JobIdLinkProps } from '../../types/JobIdLinkProps'

export const JobIdLink = ({ id }: JobIdLinkProps) => (
  <Link
    to="/worker/jobs/$id"
    params={{ id }}
    aria-label={id}
    title={id}
    className="text-accent inline-block max-w-[9ch] truncate align-bottom font-mono underline"
  >
    {id}
  </Link>
)
