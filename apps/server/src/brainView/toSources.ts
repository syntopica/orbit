// The `sources` frontmatter list: strings only, at most 200 of 1024 characters.
export const toSources = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 200)
        .map((item) => item.slice(0, 1024))
    : []
