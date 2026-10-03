export const canRenderOrbit3d = (reducedMotion: boolean): boolean => {
  if (reducedMotion || typeof window.WebGLRenderingContext === 'undefined')
    return false
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
}
