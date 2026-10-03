import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageLinksProps } from '../../types/PageLinksProps'
import { PageLink } from './PageLink'

export const PageLinks = ({ page, search }: PageLinksProps) => (
  <div className="grid gap-4 text-sm sm:grid-cols-2">
    <div>
      <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.outbound}</h3>
      <ul className="space-y-1">
        {page.outbound.map((link) => (
          <li key={link.target}>
            {link.exists ? (
              <PageLink id={link.target} search={search} />
            ) : (
              <span className="font-mono">
                {link.target}{' '}
                <span className="text-muted">{BRAIN_LABELS.missingTarget}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.inbound}</h3>
      <ul className="space-y-1">
        {page.inbound.map((other) => (
          <li key={other}>
            <PageLink id={other} search={search} />
          </li>
        ))}
      </ul>
    </div>
  </div>
)
