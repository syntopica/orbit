# orbit sub-project 4 (Remote) - design

Status: draft, revision 1. Scope: sub-project 4 of
`2026-10-01-orbit-design.md` section 2, "mobile polish, phone-specific
layouts beyond the responsive shell". Every rule of the base spec holds;
"base 6.6" points there.

## 1. Phone navigation

Below 768 px the bottom bar holds five slots: Orbit, Memory, Worker, Pending
and More. Each slot is an icon over a short label (at most 8 characters, never
truncated), with a 44 px minimum touch target and `aria-current="page"` on the
active slot. More opens a sheet listing the remaining screens (Atrium, Brain,
Clips, System) with the same icons; the sheet is a modal dialog (focus
trapped, Escape and a backdrop tap close it, focus returns to More). When the
active screen lives in the sheet, More shows as active. Icons are inline SVG
components, no icon font and no new dependency over 5 KB brotli.

From 768 px up the sidebar stays as it is.

## 2. Installable shell

- A web app manifest (`/manifest.webmanifest`): name and short name `orbit`,
  `display: standalone`, theme and background colours from the dark tokens,
  icons at 192 and 512 px plus a maskable one, `start_url: /`.
- `apple-touch-icon` and `apple-mobile-web-app-capable` for iOS.
- No service worker: base 6.6 forbids caching content, and the shell without
  one is enough to install.
- The layout respects `env(safe-area-inset-*)` at the top bar, the bottom bar
  and the sheet, so nothing sits under the notch or the home indicator.

## 3. Phone layouts

- Every screen fits 375 px without horizontal page scroll (already tested);
  wide tables keep their focusable horizontal scroller (base 7.3 rule for
  regions).
- Long identifiers (queue, job, page ids) break anywhere rather than widen the
  page.
- Charts keep their full-width band hit targets; tooltips open above the
  finger and stay inside the viewport.

## 4. Testing

Unit tests for the slot selection (which slot is active for every route).
Playwright at 375 px in dark and light: every slot navigates, More opens and
closes with keyboard and tap, the active state for a sheet screen, no label
truncation (each label's `scrollWidth <= clientWidth`), axe clean; the
manifest is served with `application/manifest+json` and parses; at 1280 px
the sidebar is unchanged.
