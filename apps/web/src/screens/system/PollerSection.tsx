import { usePoller } from '../../hooks/usePoller'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { POLLER_LABELS } from '../../labels/pollerLabels'

export const PollerSection = () => {
  const { lines, failed } = usePoller()
  return (
    <section aria-label={POLLER_LABELS.title} className="space-y-3">
      <h2 className="text-muted text-sm font-semibold uppercase">
        {POLLER_LABELS.title}
      </h2>
      {failed ? <p role="alert">{POLLER_LABELS.failed}</p> : null}
      {lines?.length === 0 ? (
        <p className="text-muted text-sm">{POLLER_LABELS.empty}</p>
      ) : null}
      <ul className="border-line bg-panel divide-line divide-y rounded-xl border">
        {(lines ?? []).map((line) => (
          <li
            key={line.component}
            data-state={line.state}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2 text-sm"
          >
            <span className="font-medium">
              {COMPONENT_LABELS[line.component]}
            </span>
            <span
              className={
                line.state === 'ok' || line.state === 'reading'
                  ? 'text-muted'
                  : 'text-warn font-medium'
              }
            >
              {POLLER_LABELS[line.state]}
            </span>
            <span className="text-muted tabular-nums">{line.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
