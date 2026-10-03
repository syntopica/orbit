import type { HitBandsProps } from '../../types/HitBandsProps'

// Transparent full-height bands: the hit target is the whole bucket, larger
// than its mark. Touch shows the bucket on tap.
export const HitBands = ({ bands, height, onShow }: HitBandsProps) => (
  <g>
    {bands.map((band, i) => (
      <rect
        key={band.x}
        data-testid="hit-band"
        x={band.x}
        y={0}
        width={band.width}
        height={height}
        fill="transparent"
        onPointerEnter={() => {
          onShow(i)
        }}
        onPointerDown={() => {
          onShow(i)
        }}
      />
    ))}
  </g>
)
