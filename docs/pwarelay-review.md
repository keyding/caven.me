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
- `https://github.com/terminalzero-dev/pwarelay` returned HTTP 404. No public
  source destination was verified, so the entry omits the source link.
- The official landing page labels its product scenario as a sample project.
  This slice uses the specification's text-led fallback, without screenshots,
  fabricated UI, or an empty image placeholder.
- The source resume remains local and unchanged; it is not committed.

## Implementation

`src/data/projects.ts` holds stable project identity, optional website/source
destinations and equivalent English/Chinese content. `ProjectEntry.astro`
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
