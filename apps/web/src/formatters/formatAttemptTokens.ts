// Tokens are unknown until an attempt completes.
export const formatAttemptTokens = (
  tokensIn: number | null,
  tokensOut: number | null,
): string => `${String(tokensIn ?? '—')} in · ${String(tokensOut ?? '—')} out`
