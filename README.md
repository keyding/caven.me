# caven.me

A minimal static Astro site. The homepage is deliberately one placeholder line;
portfolio content and deployment are separate work.

## Setup

Use Node.js **24.21.0** (see `.node-version`) and npm **11.19.0**.
Install the exact dependency tree and Chromium:

```sh
npm ci
npx vp run test:install
```

Direct dependencies are pinned in `package.json`; `package-lock.json` locks the
transitive tree. TypeScript stays on 5.9.3, within the supported ranges of
`@astrojs/check` and `typescript-eslint`.

## Commands

Run these from the repository root. `npx vp` uses the installed, pinned Vite+ CLI.

| Command                              | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `npx vp run dev`                     | Astro development server at `http://localhost:4321`        |
| `npx vp run build`                   | Astro static production build in `dist/`                   |
| `npx vp run preview`                 | Serve the existing production build                        |
| `npx vp run format`                  | Format maintained application files and documentation      |
| `npx vp run format:check`            | Check formatting without modifying files                   |
| `npx vp run lint`                    | ESLint recommended JavaScript, TypeScript, and Astro rules |
| `npx vp run typecheck`               | Astro diagnostics and TypeScript checking                  |
| `npx vp run test`                    | Build, start an isolated preview, and test in Chromium     |
| `npx vp run test tests/home.test.ts` | Run the homepage browser test only                         |

Use **`vp run dev/build/preview`**, as shown above. The bare `vp dev`, `vp build`,
and `vp preview` commands invoke Vite rather than the Astro package scripts.
See the [Vite+ task documentation](https://viteplus.dev/guide/run).

## Checks and test boundary

```sh
npx vp run format:check
npx vp run lint
npx vp run typecheck
npx vp run test
```

Prettier uses `prettier-plugin-astro` to format `.astro` templates, including
frontmatter and native CSS. ESLint uses `eslint-plugin-astro` to lint templates
and `typescript-eslint` for TypeScript. `astro check` checks Astro expressions
and TypeScript; generic Vite+ checks alone are not the Astro validation gate.
See [Astro editor tooling](https://docs.astro.build/en/editor-setup/).
Existing agent configuration is excluded from formatting and linting.

The shared Playwright suite observes the **built website through a browser**.
It runs the homepage check at desktop and phone sizes, verifies a successful
response and one visible placeholder line, and checks horizontal overflow.
It always builds and starts its own preview on `127.0.0.1:4321`; stop any other
server on that port first. Future slices should extend this suite at the same
public boundary. Failure traces are written to ignored `test-results/`.

For manual production inspection, run `npx vp run build` followed by
`npx vp run preview`. No hosting or domain configuration is included.

## Bootstrap verification

The initial slice was verified with a clean `npm ci`, production build and
preview, and the desktop/mobile browser test. The test first failed against an
empty homepage, then passed after the placeholder was implemented.

Temporary `.astro` fault probes confirmed that formatting rejects malformed
spacing, linting rejects conflicting `set:text`/`set:html` directives, and
`astro check` rejects both frontmatter type mismatches and undefined template
expressions. The probes were removed after verification.

Astro 7 auto-backgrounds servers in detected agent environments. The Playwright
server environment sets `ASTRO_PREVIEW_BACKGROUND=1` to keep the preview attached
so Playwright can own its lifecycle. This behavior was verified against the
pinned Astro version and should be rechecked on upgrades. For manually started
background servers, use `npx vp run dev stop` or `npx vp run preview stop`.
