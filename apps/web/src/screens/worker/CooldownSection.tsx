import { formatLocalTime } from '../../formatters/formatLocalTime'
import { formatSpan } from '../../formatters/formatSpan'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { CooldownSectionProps } from '../../types/CooldownSectionProps'

export const CooldownSection = ({ cooldowns, now }: CooldownSectionProps) => (
  <section aria-labelledby="cooldowns-heading" className="space-y-2">
    <h2
      id="cooldowns-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      {WORKER_LABELS.cooldowns}
    </h2>
    {cooldowns.length === 0 ? (
      <p className="text-muted text-sm">{WORKER_LABELS.noCooldowns}</p>
    ) : (
      <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
        {cooldowns.map((c) => (
          <li key={c.runner} className="flex flex-wrap gap-x-3 px-3 py-2">
            <code className="font-mono">{c.runner}</code>
            <span>
              {WORKER_LABELS.availableIn} {formatSpan(c.availableAt - now)}
            </span>
            <span className="text-muted">
              {WORKER_LABELS.at}{' '}
              <time dateTime={new Date(c.availableAt).toISOString()}>
                {formatLocalTime(c.availableAt)}
              </time>
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
)
