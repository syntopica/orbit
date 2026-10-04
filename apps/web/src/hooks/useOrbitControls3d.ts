import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { cameraDistance3d } from '../geometry/cameraDistance3d'

// Drag to rotate, scroll or pinch to zoom; frames are drawn on demand, so an
// idle scene costs nothing and nothing moves without the user. Each scene is
// framed whole from the front, however wide its layout came out.
export const useOrbitControls3d = (extent: number): void => {
  const get = useThree((state) => state.get)
  const element = useThree((state) => state.gl.domElement)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    // Read through `get`: the camera is three.js state this effect moves.
    const { camera } = get()
    const controls = new OrbitControls(camera, element)
    const distance = cameraDistance3d(extent)
    camera.position.set(0, 0, distance)
    camera.near = distance / 100
    camera.far = distance * 4
    camera.updateProjectionMatrix()
    controls.target.set(0, 0, 0)
    controls.update()
    const redraw = (): void => {
      invalidate()
    }
    controls.addEventListener('change', redraw)
    invalidate()
    return () => {
      controls.removeEventListener('change', redraw)
      controls.dispose()
    }
  }, [get, element, invalidate, extent])
}
