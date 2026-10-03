import type { MemoryFlowBodyProps } from '../../types/MemoryFlowBodyProps'
import { FlowCanvas } from './FlowCanvas'
import { StageList } from './StageList'
import { StagePanel } from './StagePanel'

export const MemoryFlowBody = ({ flow, model }: MemoryFlowBodyProps) => (
  <div
    className={
      model.isPhone || model.selected === null
        ? 'grid gap-4'
        : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'
    }
  >
    {model.isPhone ? (
      <StageList
        flow={flow}
        stages={flow.stages}
        selectedId={model.selected?.id ?? null}
        onSelect={model.select}
      />
    ) : (
      <FlowCanvas
        flow={flow}
        selectedId={model.selected?.id ?? null}
        onSelect={model.select}
        animate={model.animate}
      />
    )}
    {model.isPhone || model.selected === null ? null : (
      <StagePanel
        stage={model.selected}
        flow={flow}
        onClose={() => {
          model.select(null)
        }}
      />
    )}
  </div>
)
