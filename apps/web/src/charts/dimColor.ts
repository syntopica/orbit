// A hex colour at about a tenth of its opacity, for nodes away from the
// hovered one; other notations are returned unchanged.
export const dimColor = (color: string): string =>
  /^#[\da-f]{6}$/i.test(color) ? `${color}1a` : color
