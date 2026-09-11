# caven.me

A minimal static Astro site. The homepage is deliberately one placeholder line;
portfolio content and deployment are separate work.

## Setup

Use Node.js **24.21.0** (see `.node-version`) and pnpm **11.18.0**.
Install the exact dependency tree and Chromium:

```sh
pnpm install --frozen-lockfile
pnpm exec vp run test:install
```

Direct dependencies are pinned in `package.json`; `pnpm-lock.yaml` locks the
transitive tree. `pnpm-workspace.yaml` permits esbuild's installation script;
this remains a single-project repository. TypeScript stays on 5.9.3, within the
supported range of `@astrojs/check`. Vite resolves to the matching Vite+ core
alias, following the [Vite+ pnpm setup](https://viteplus.dev/guide/migrate-rules).
The peer-version rule accepts that pinned core's version number.

## Commands

Run these from the repository root. `pnpm exec vp` uses the installed, pinned Vite+ CLI.

| Command                                    | Purpose                                                |
| ------------------------------------------ | ------------------------------------------------------ |
| `pnpm exec vp run dev`                     | Astro development server at `http://localhost:4321`    |
| `pnpm exec vp run build`                   | Astro static production build in `dist/`               |
| `pnpm exec vp run preview`                 | Serve the existing production build                    |
| `pnpm exec vp run format`                  | Format supported files with Vite+'s Oxfmt              |
| `pnpm exec vp run format:check`            | Check formatting without modifying files               |
| `pnpm exec vp run lint`                    | Lint with Vite+'s Oxlint; fail on warnings             |
| `pnpm exec vp run typecheck`               | Astro diagnostics and TypeScript checking              |
| `pnpm exec vp run test`                    | Build, start an isolated preview, and test in Chromium |
| `pnpm exec vp run test tests/home.test.ts` | Run the homepage browser test only                     |

Use **`vp run dev/build/preview`**, as shown above. The bare `vp dev`, `vp build`,
and `vp preview` commands invoke Vite rather than the Astro package scripts.
See the [Vite+ task documentation](https://viteplus.dev/guide/run).

## Checks and test boundary

```sh
pnpm exec vp run format:check
pnpm exec vp run lint
pnpm exec vp run typecheck
pnpm exec vp run test
```

Vite+ supplies both Oxlint and Oxfmt; their configuration lives in
`vite.config.ts`. There are no separate ESLint or Prettier dependencies.
Existing agent configuration is excluded from formatting and linting.

**Astro coverage:** Oxfmt in the pinned Vite+ version does not format `.astro`
files. Keep their markup and embedded CSS formatted manually. Oxlint checks
frontmatter and `<script>` JavaScript/TypeScript regions, not Astro template
directives. Temporary `debugger` probes verified both regions are checked.
`astro check` remains required for frontmatter types and template expressions;
a successful lint/format run alone does not validate an Astro template.

The shared Playwright suite observes the **built website through a browser**.
It runs the homepage check at desktop and phone sizes, verifies a successful
response and one visible placeholder line, and checks horizontal overflow.
It always builds and starts its own preview on `127.0.0.1:4321`; stop any other
server on that port first. Future slices should extend this suite at the same
public boundary. Failure traces are written to ignored `test-results/`.

For manual production inspection, run `pnpm exec vp run build` followed by
`pnpm exec vp run preview`. No hosting or domain configuration is included.

Astro 7 auto-backgrounds servers in detected agent environments. The Playwright
server environment sets `ASTRO_PREVIEW_BACKGROUND=1` to keep the preview attached
so Playwright can own its lifecycle. This behavior was verified against the
pinned Astro version and should be rechecked on upgrades. For manually started
background servers, use `pnpm exec vp run dev stop` or `pnpm exec vp run preview stop`.
