# PWARelay dashboard artwork

This is a locally rendered **redesign preview with sample data**, requested for
Caven's portfolio while the product dashboard is being redesigned. It is not a
capture of the deployed PWARelay UI or customer activity. This source is not
included in the Astro route tree; only the resulting WebP is public.

## Sources

- Visual references: [Efferd Dashboard 8](https://efferd.com/view/dashboard-8#/content-calendar)
  for the sidebar, bordered shell and inset metric cards;
  [Bklit area charts](https://bklit.com/charts/area-chart) for subtle grids,
  smooth lines and gradient area fills. Both were inspected in a browser.
- Product source: the user-provided PWARelay checkout, revision `ef6a8d4`.
  Reviewed `CONTEXT.md`, ADR 0008, and `funnel-dashboard-page.tsx` for Project
  Environment scope, Anonymous Subject units, the five acquisition/install
  steps, the 30-day mature window and coverage/integrity terminology.
- The original HTML/CSS/SVG presentation uses local Geist. It imports no
  third-party dashboard code and calls no product APIs. Source files in the
  PWARelay checkout were not modified.

## Dataset

All values are illustrative. The daily series total 1,200 eligible Anonymous
Subjects and 300 observed installs. Funnel counts are 1,200 → 720 → 480 → 300 → 240. The three source rows reconcile to 1,200 and 300; completion is 25%.
The selected entry dates are July 1–30, with the 30-day window mature through
August 29. These figures are not portfolio outcome claims.

## Reproduce

1. Install this repository's dependencies to make its local Geist files available.
2. Serve the repository root locally, for example `python3 -m http.server 4323 --bind 127.0.0.1`.
3. Open `/docs/artwork/pwarelay-dashboard/` in Chromium at 1600 × 1000, device scale 1.
4. Wait for `document.fonts.ready`, then capture the viewport to PNG.
5. Encode that capture as WebP at quality 93 (Pillow), to
   `public/images/pwarelay-dashboard.webp`.

Keep both the embedded preview/sample-data notice and the localized portfolio
caption when exporting. Only replace this with a live-product screenshot once
that product UI exists and has been reviewed.
