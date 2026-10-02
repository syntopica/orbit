// Exit code `launchctl print` returns for "Could not find service" (measured
// against a nonexistent label). Any other non-zero exit is an unreadable label,
// not an unloaded one.
export const SERVICE_NOT_FOUND_EXIT = 113
