import { formatCount } from '../../formatters/formatCount'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { groupIssues } from '../../selectors/groupIssues'
import type { LintPanelProps } from '../../types/LintPanelProps'
import { PageLink } from './PageLink'

// D13: one disclosure per code; each page selects itself on the graph.
export const LintPanel = ({ checks, search }: LintPanelProps) => {
  const groups = groupIssues(checks.issues)
  return (
    <section
      aria-label={BRAIN_LABELS.lint}
      className="border-line bg-panel space-y-3 rounded-xl border p-4 text-sm"
    >
      <h2 className="text-lg font-semibold">{BRAIN_LABELS.lint}</h2>
      {checks.indexStale ? (
        <p className="text-warn">{BRAIN_LABELS.indexStale}</p>
      ) : null}
      {groups.length === 0 ? (
        <p className="text-muted">{BRAIN_LABELS.lintNone}</p>
      ) : null}
      {groups.map((group) => (
        <details key={group.code}>
          <summary className="cursor-pointer font-mono">
            {group.code}{' '}
            <span className="text-muted">
              {formatCount(group.pages.length)}
            </span>
          </summary>
          <ul className="mt-1 space-y-1 pl-4">
            {group.pages.map((page) => (
              <li key={page}>
                <PageLink id={page} search={search} />
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  )
}
