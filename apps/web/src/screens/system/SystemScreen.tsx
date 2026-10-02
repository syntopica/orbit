import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useSystemModel } from '../../hooks/useSystemModel'
import { SYSTEM_LABELS } from '../../labels/systemLabels'
import { LaunchdRowView } from './LaunchdRowView'
import { RangePicker } from './RangePicker'

export const SystemScreen = () => {
  const model = useSystemModel()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {SYSTEM_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
        <RangePicker range={model.range} onChange={model.setRange} />
      </header>
      {model.failed ? <p role="alert">{SYSTEM_LABELS.catalogFailed}</p> : null}
      {model.rows?.length === 0 && (
        <p className="text-muted">{SYSTEM_LABELS.empty}</p>
      )}
      <ul className="space-y-3">
        {(model.rows ?? []).map((row) => (
          <LaunchdRowView key={row.label} row={row} range={model.range} />
        ))}
      </ul>
    </main>
  )
}
