import { useStageListItem } from '../../hooks/useStageListItem'

import type { StageListItemProps } from '../../types/StageListItemProps'
import { StageButton } from './StageButton'
import { StagePanel } from './StagePanel'

export const StageListItem = ({
  stage,
  selected,
  onSelect,
  flow,
}: StageListItemProps) => {
  const { buttonRef, close } = useStageListItem(onSelect)
  return (
    <li className="space-y-2">
      <StageButton
        stage={stage}
        selected={selected}
        onSelect={onSelect}
        buttonRef={buttonRef}
      />
      {selected && flow !== null ? (
        <StagePanel stage={stage} flow={flow} onClose={close} />
      ) : null}
    </li>
  )
}
