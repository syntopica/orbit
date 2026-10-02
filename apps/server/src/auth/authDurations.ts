export const AUTH_DURATIONS = {
  sessionSlidingMs: 7 * 86_400_000,
  sessionAbsoluteMs: 30 * 86_400_000,
  invitationMs: 5 * 60_000,
  invitationMaxFailures: 5,
} as const
