import { CanvasTexture, SRGBColorSpace } from 'three'

import type { LabelTexture } from '../types/LabelTexture'
import { LABEL_FONT_PX } from './labelFontPx'
import { LABEL_PADDING_PX } from './labelPaddingPx'

// A page id drawn once into a canvas for a 3D sprite label.
export const createLabelTexture = (
  text: string,
  color: string,
): LabelTexture => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const font = `600 ${String(LABEL_FONT_PX)}px Geist Sans, ui-sans-serif, sans-serif`
  if (context !== null) context.font = font
  const width = Math.ceil(
    (context?.measureText(text).width ?? 0) + 2 * LABEL_PADDING_PX,
  )
  canvas.width = Math.max(1, width)
  canvas.height = LABEL_FONT_PX + 2 * LABEL_PADDING_PX
  if (context !== null) {
    context.font = font
    context.fillStyle = color
    context.textBaseline = 'middle'
    context.fillText(text, LABEL_PADDING_PX, canvas.height / 2)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return { texture, aspect: canvas.width / canvas.height }
}
