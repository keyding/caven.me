# Homepage layout review — issue #3

Status: **awaiting Caven's explicit layout approval**. This implementation and
its passing checks do not complete [issue #3](https://github.com/keyding/caven.me/issues/3).
Keep the issue open and do not begin the next content ticket until approval is recorded.

## Composition

- A centered content column capped at 768px; 32px section gaps on desktop.
- The latest revision removes continuous side rules and section borders, using
  warm white surfaces and whitespace. The Experience timeline and one faint
  footer metadata divider remain; project-card borders are still provisional.
- Six regions, separated by spacing and headings rather than colored panels: navigation, introduction,
  selected work, experience, additional work, and footer.
- A generous introduction followed immediately by three equally weighted project
  slots. Three independently collapsible timeline entries and one additional-work slot follow.
  Each entry keeps company, location, role, employment period, and skill tags
  visible. Clicking the role row reveals two contribution placeholders. The first
  entry starts open; the others start closed. Native details/summary supports
  pointer, Enter, and Space without JavaScript. Markers and a vertical rule
  connect the entries; the heading stacks on phones.
- At 640px and below, project cards stack, the portrait moves above the
  introduction, and outer gutters reduce to 16px with 24px section gaps.
- Warm white background, charcoal labels, subtle borders, and restrained blue
  emphasis. Color fills describe regions for review, not final project artwork.
- Content sections use labels and decorative bars only: no biography, project claims, resume details,
  real portrait, final project imagery, working contact controls, or localized content.
  The footer now previews farewell copy, a Caven script-font signature concept,
  copyright and non-interactive Email/GitHub labels, plus the generated Tianchi
  illustration candidate explicitly requested by Caven. This is not final artwork.
  Decorative bars are excluded from the accessibility tree. Disclosure summaries
  are keyboard reachable and have visible focus outlines.
- Font stacks name the agreed Instrument Serif / Geist faces and Chinese
  fallbacks; this structural preview does not bundle fonts. Final typography,
  real content wrapping, localization, and motion need later validation.
- The temporary preview is marked `noindex`; production metadata belongs to the
  later release work and must replace this directive before launch.

## Header and footer direction

Section headings use a restrained blue curved underline, inspired by the supplied
Opensource UI reference. This is original native CSS, without importing its React
components or adding a framework dependency.

The footer text keeps the 768px column without outer borders. Its farewell and
script-font signature concept sit above a compact copyright/contact row. The
Tianchi illustration fills the page width without a desktop cap, scales proportionally,
and blends its white background into the warm page surface. The PNG is the original
AI-generated candidate from this conversation, copied to `public/images/` and
served locally. No third-party illustration was copied. Signature typography is
only a system-script-font placeholder, not a finished custom signature asset.

[Desktop footer](layout-evidence/footer-desktop.png) ·
[Mobile footer](layout-evidence/footer-mobile.png) ·
[2560px wide footer](layout-evidence/footer-wide.png)

768px is a composition choice, not an accessibility requirement. After 32px side padding, the main text area is about 704px. Real bilingual text
will need its own line-length check and narrower paragraph measures if necessary.
The landscape can extend wider without making prose lines longer.

Experience motion remains deferred to the real-content implementation per Caven's
request: subtle opening/closing and arrow feedback, respecting reduced motion.

## Actual browser evidence

Updated on 2026-09-14 from the production build using the shared Playwright
Chromium suite, then opened and visually inspected. These are full-page captures,
not design mockups. The desktop screenshot uses a 1280 × 720 CSS-pixel viewport;
the phone uses 390 × 664 CSS pixels with the iPhone 13 device preset (3× raster scale).

[Desktop full-page preview](layout-evidence/desktop.png) ·
[Mobile full-page preview](layout-evidence/mobile.png)

![Desktop layout](layout-evidence/desktop.png)

![Mobile layout](layout-evidence/mobile.png)

All six regions remain readable and separate. The project grid changes from
three columns to one without clipping. The built preview was also opened in
the Codex in-app browser at `http://127.0.0.1:4322` for interactive review.

## References inspected

Both reference sites were rendered and visually inspected in the functioning
Codex in-app browser on 2026-09-11 after Ego Lite screenshot capture timed out:

- [bidyut.cc](https://bidyut.cc/): light surface, serif profile heading, a narrow
  central reading column with navigation/contact information at the sides,
  faint grid rules, generous space before the experience section.
- [chanhdai.com](https://chanhdai.com/): observed in its dark presentation, with a
  narrow centered column, compact top navigation, prominent hero and portrait,
  and finely divided information rows. This proposal adapts the column and
  hierarchy to the agreed light direction instead of reproducing that theme.

This is a new composition informed by those observations. No motion fidelity
is claimed; this placeholder slice contains no animation.

## Validation

The pre-agreed boundary is the built website's browser-visible behavior (#1).
The updated homepage test first failed on desktop and mobile because the
navigation region did not exist. After implementation, both tests passed.

- `pnpm exec vp run lint`: passed.
- `pnpm exec vp run typecheck`: zero errors, warnings, or hints.
- `pnpm exec vp run test`: full suite passed, 4/4; includes production build.
- Browser assertions: HTTP 200, six visible regions in reading order, disjoint
  region bounds, horizontal containment, and three project slots.
- Screenshots are generated by the test in `test-results/`; the reviewed copies
  above are committed so the PR can be reviewed without a local server.
- Responsive illustration: verified edge-to-edge width, preserved 3:1 aspect
  ratio, and no horizontal overflow at 320, 390, 1920, and 2560px.
- Disclosure regression: default states, independent opening/closing, tags
  remaining visible when collapsed, pointer, Enter, and Space on desktop/mobile.
- [Expanded desktop Experience](layout-evidence/experience-desktop.png) and
  [expanded mobile Experience](layout-evidence/experience-mobile.png) show two
  entries open at once after interaction.

## Approval record

Revision requested by Caven: introduce a line-based treatment and reconsider the
960px column. The revised preview caps the column at 768px and adds continuous
side rules and horizontal section dividers. Caven also requested an expanded Experience placeholder preview with company,
period, role, and two contributions per entry, then requested independent
expand/collapse behavior matching the supplied reference screenshots. The latest
revision keeps summary information and tags visible while toggling contributions.
The latest revision removes outer lines and colored section backgrounds at
Caven's request, preserving the Experience timeline and a single footer divider.
The illustration now grows with the entire page width, including wide desktops.
These requests are not final approval.

Pending. Review the relative width, section spacing, introduction height,
project-card proportions, and mobile reading order. Record Caven's decision
and any adjustments here before treating the layout as approved.
