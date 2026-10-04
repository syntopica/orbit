import { Link } from '@tanstack/react-router'

import { shortenId } from '../../formatters/shortenId'
import type { JobIdLinkProps } from '../../types/JobIdLinkProps'

export const JobIdLink = ({ id }: JobIdLinkProps) => (
  <Link
    to="/worker/jobs/$id"
    params={{ id }}
    aria-label={id}
    title={id}
    className="text-accent font-mono underline"
  >
    {shortenId(id)}
  </Link>
)
