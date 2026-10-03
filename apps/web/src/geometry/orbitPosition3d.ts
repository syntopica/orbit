export const orbitPosition3d = (
  index: number,
  angle: number,
): [number, number, number] => {
  const radius = index < 3 ? 2.35 : 3.85
  const lane = index < 3 ? index : index - 3
  const count = index < 3 ? 3 : 4
  const phase =
    (lane / count) * Math.PI * 2 - Math.PI / 2 + angle + (index < 3 ? 0 : 0.38)
  const x = Math.cos(phase) * radius
  const y = Math.sin(phase) * radius * 0.75
  const z = Math.sin(phase) * radius * 0.52
  return [x, y, z]
}
