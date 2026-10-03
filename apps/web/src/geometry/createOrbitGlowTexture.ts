import { CanvasTexture } from 'three'

export const createOrbitGlowTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.42)')
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.08)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }
  return new CanvasTexture(canvas)
}
