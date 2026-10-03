import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageDetailsProps } from '../../types/PageDetailsProps'
import { PageLinks } from './PageLinks'
import { PageMarkdown } from './PageMarkdown'

export const PageDetails = ({ page, search }: PageDetailsProps) => (
  <>
    <p className="text-muted font-mono text-xs break-all">
      {[
        page.id,
        page.type,
        page.updated === null
          ? null
          : `${BRAIN_LABELS.updated} ${page.updated}`,
      ]
        .filter(Boolean)
        .join(' · ')}
    </p>
    {page.summary === null ? null : <p className="text-sm">{page.summary}</p>}
    {page.truncated ? (
      <p className="text-warn text-sm">{BRAIN_LABELS.truncated}</p>
    ) : null}
    <PageMarkdown body={page.body} search={search} />
    {page.sources.length === 0 ? null : (
      <div className="text-sm">
        <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.sources}</h3>
        <ul className="font-mono text-xs break-all">
          {page.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </div>
    )}
    <PageLinks page={page} search={search} />
  </>
)
