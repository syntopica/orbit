export const toggleHidden = (
  hide: readonly string[],
  type: string,
): string[] =>
  hide.includes(type) ? hide.filter((other) => other !== type) : [...hide, type]
