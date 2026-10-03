import { useFrame } from '@react-three/fiber'

export const OrbitCamera = () => {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.025
    camera.position.y += (4.2 + pointer.y * 0.2 - camera.position.y) * 0.025
    camera.lookAt(0, 0, 0)
  })
  return null
}
