// Park-Miller: deterministic and free of bitwise operators, so a layout and
// its communities repeat exactly for the same graph (D9).
export const seededRandom = (seed: number): (() => number) => {
  let state = (Math.abs(Math.trunc(seed)) % 2_147_483_646) + 1
  return () => {
    state = (state * 16_807) % 2_147_483_647
    return (state - 1) / 2_147_483_646
  }
}
