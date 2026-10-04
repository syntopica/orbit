import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { HISTORY_RANGE_OPTIONS } from '../../heartbeat/historyRangeOptions'
import { useSystemModel } from '../../hooks/useSystemModel'
import { SYSTEM_LABELS } from '../../labels/systemLabels'
import { groupRowsByComponent } from '../../selectors/groupRowsByComponent'
import { HeartbeatLegend } from './HeartbeatLegend'
import { LaunchdGroup } from './LaunchdGroup'
import { PollerSection } from './PollerSection'
import { RangePicker } from './RangePicker'

export const SystemScreen = () => {
  const model = useSystemModel()
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {SYSTEM_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
        <RangePicker
          options={HISTORY_RANGE_OPTIONS}
          range={model.range}
          onChange={model.setRange}
        />
      </header>
      {model.failed ? <p role="alert">{SYSTEM_LABELS.catalogFailed}</p> : null}
      {model.rows?.length === 0 && (
        <p className="text-muted">{SYSTEM_LABELS.empty}</p>
      )}
      {model.rows !== null && model.rows.length > 0 ? (
        <HeartbeatLegend range={model.range} />
      ) : null}
      {groupRowsByComponent(model.rows ?? []).map((group) => (
        <LaunchdGroup key={group.component} group={group} range={model.range} />
      ))}
      <PollerSection />
    </main>
  )
}
