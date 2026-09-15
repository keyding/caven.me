# PWARelay homepage entry — issue #5

## Content and destinations

Reviewed on 2026-09-15 against the PWARelay section of the supplied Chinese
resume, `丁强 - 高级前端工程师.pdf`. Both locales describe the same purpose,
independent developer role, product architecture/full-stack work, technology
stack, and reusable SDKs. No dates, package/test counts, adoption metrics, or
general-availability claims are published.

- `https://pwarelay.com` returned HTTP 200. Browser inspection confirmed the
  PWARelay lifecycle-infrastructure landing page. It labels Quickstart as
  pending review; the portfolio makes no claim that onboarding is available.
- The actual source repository was verified as private after inspecting the
  user-provided checkout; the portfolio omits its source link.
- At the user's request, the project now includes a real browser capture of a
  locally rendered dashboard redesign preview. Its sample data and preview
  status are labelled inside the image and in both localized captions. See
  [artwork source and provenance](artwork/pwarelay-dashboard/README.md).
- The source resume remains local and unchanged; it is not committed.

## Implementation

`src/data/projects.ts` holds stable project identity, optional website/source
destinations, optional image metadata and equivalent English/Chinese content. `ProjectEntry.astro`
renders the entry on both homepages. Additional entries can use this same
model without adding routes. The two remaining project placeholders stay
reserved for issue #7.

The heading links to `#pwarelay`. The existing locale switch preserves that
fragment. Native links and readable static content need no animation setup.
Project links inherit restrained hover color feedback and visible keyboard
focus; reduced motion disables the color transition.

## Validation

The new browser suite uses the built-site boundary approved in issue #1.
The first content test failed against the original placeholders, then passed
after implementation in both locales and viewport projects. Coverage includes
verified/omitted destinations, fragment entry and refresh, language switching,
keyboard focus, responsive bounds, reduced motion, and JavaScript-free content.

Final local checks: formatting, lint, Astro typecheck (0 errors/warnings/hints),
production build and all 86 browser tests passed. The project suite contributes
10 tests across the desktop/mobile projects.

Live Chromium review covered English and Chinese at 1280px and 390px, including
mixed-script wrapping, spacing, fragment positioning below the sticky header,
and the website hover treatment. Browser assertions additionally cover 320px
and 2560px bounds, visible keyboard focus and reduced motion. The text entry
stays static rather than adding decorative entrance movement.

- [English desktop](pwarelay-evidence/en-desktop.png)
- [Chinese desktop](pwarelay-evidence/zh-desktop.png)
- [English mobile](pwarelay-evidence/en-mobile.png)
- [Chinese mobile](pwarelay-evidence/zh-mobile.png)

Independent code-review passes against branch base `e8a9d4d` reported
0 Standards findings and 0 Spec findings. Production deployment is outside
this PR's verification scope.

## Favicon follow-up

The adaptive SVG was verified white under a dark media preference, while the
ICO contained only dark foreground pixels. A regression test against the
served raster icon failed (zero opaque light pixels), then passed after adding
an opposite-color outline. SVG retains its media-query foreground and gains
an opposite-color outline; the regenerated 16/32/48px ICO has a dark foreground
and white outline on a transparent canvas. This protects contrast when browser
chrome uses the raster fallback or a theme different from the OS preference.
Versioned icon URLs invalidate the prior metadata references.

The browser-visible tests cover the served ICO pixels, SVG theme switching,
the project image's successful decode, localized caption, and removal of the
Selected work / 精选项目 header's Project / 项目 label. This does not claim to
identify which icon the user's browser chrome selected from the screenshot.

[Icon contrast evidence](pwarelay-evidence/favicon-contrast.png) renders the actual
16px/32px ICO and SVG on light and dark backgrounds with a light OS preference.
Follow-up review against `10502d0`: the sole Standards suggestion (clearer chart
path variable names) was applied; Spec review reported 0 findings.

## Image presentation and preview

The user requested a layered background and click-to-enlarge behavior. The
thumbnail now sits on a muted sage/warm-gray gradient with responsive padding,
rounded corners and a restrained shadow. The screenshot file and its explicit
sample-data caption remain unchanged.

`ProjectImage.astro` owns the small image interaction: its real image link
progressively opens a native modal dialog, with localized labels, original-file
access, visible keyboard focus, Tab/Shift+Tab wrapping, Escape/close/backdrop
dismissal and focus restoration. The background page is scroll-locked while
open. Without JavaScript, the image link opens the original file. Reduced motion
omits the short entrance and thumbnail hover movement.

The browser regression suite covers both languages and desktop/mobile controls,
original-file fallback, modal containment, dismissal and focus restoration.

Validation: all 92 browser tests passed. After converting presentation styles to
Tailwind per review, Astro checking and the 16 image/project tests passed again;
formatting and lint also passed. Standards re-review and Spec review both have
0 outstanding findings. Desktop (1280px) and mobile (390px) browser captures:

- [Framed thumbnail, desktop](pwarelay-evidence/image-frame-desktop.png)
- [Framed thumbnail, mobile](pwarelay-evidence/image-frame-mobile.png)
- [Large preview, desktop](pwarelay-evidence/image-preview-desktop.png)
- [Large preview, mobile](pwarelay-evidence/image-preview-mobile.png)
