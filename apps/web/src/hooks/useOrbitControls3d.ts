import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Drag to rotate, scroll or pinch to zoom; frames are drawn on demand, so an
// idle scene costs nothing and nothing moves without the user.
export const useOrbitControls3d = (): void => {
  const camera = useThree((state) => state.camera)
  const element = useThree((state) => state.gl.domElement)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    const controls = new OrbitControls(camera, element)
    const redraw = (): void => {
      invalidate()
    }
    controls.addEventListener('change', redraw)
    return () => {
      controls.removeEventListener('change', redraw)
      controls.dispose()
    }
  }, [camera, element, invalidate])
}
