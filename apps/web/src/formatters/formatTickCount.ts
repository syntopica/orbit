// A y-axis count short enough for the chart's 28 px left margin: atrium's
// tokens per day run to 30,000,000, which overflowed the card as written out.
// en-US because en-GB's compact suffix is a lowercase "m", read as minutes.
export const formatTickCount = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
