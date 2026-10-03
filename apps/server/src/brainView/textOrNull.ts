// A frontmatter value shown as text: strings only, cut to `max` characters.
export const textOrNull = (value: unknown, max: number): string | null =>
  typeof value === 'string' ? value.slice(0, max) : null
