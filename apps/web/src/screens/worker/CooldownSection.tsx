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
      <ul className="divide-line border-line bg-panel grid grid-cols-[minmax(0,max-content)_1fr] divide-y rounded-xl border text-sm md:grid-cols-[minmax(0,max-content)_max-content_1fr]">
        {cooldowns.map((c) => (
          <li
            key={c.runner}
            className="col-span-full grid grid-cols-subgrid gap-x-4 px-3 py-2"
          >
            <code className="font-mono break-all">{c.runner}</code>
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
