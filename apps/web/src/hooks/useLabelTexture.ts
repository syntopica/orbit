import { useEffect, useMemo } from 'react'

import { createLabelTexture } from '../graph/createLabelTexture'
import type { LabelTexture } from '../types/LabelTexture'

export const useLabelTexture = (text: string, color: string): LabelTexture => {
  const label = useMemo(() => createLabelTexture(text, color), [text, color])
  useEffect(
    () => () => {
      label.texture.dispose()
    },
    [label],
  )
  return label
}
