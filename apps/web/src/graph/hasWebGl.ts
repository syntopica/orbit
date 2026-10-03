// D12: without WebGL the list, page view and panels still work.
export const hasWebGl = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) !== null
  } catch {
    return false
  }
}
