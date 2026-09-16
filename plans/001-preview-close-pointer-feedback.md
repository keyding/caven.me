# 001 — Add pointer-only feedback to the preview close icon

- **Status**: DONE
- **Commit**: 277e6c4
- **Severity**: LOW
- **Category**: Missed opportunities / feedback
- **Estimated scope**: 2 files, approximately 70–110 changed lines including tests
- **Repository**: `/Users/caven/workspace/caven/projects/caven.me`

## Problem

The PWARelay image preview has an occasional close action with no pointer-down feedback. The existing Pikaicons SVG can acknowledge a press without moving its 44px target or delaying dismissal.

Current code in `/Users/caven/workspace/caven/projects/caven.me/src/components/ProjectImage.astro:22`:

```astro
<button class="grid size-11 shrink-0 place-items-center cursor-pointer rounded-lg border border-[#ffffff29] bg-[#ffffff0d] text-inherit hover:bg-[#ffffff24] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-highlight focus-visible:outline-offset-3" type="button" aria-label={closeLabel} data-image-close autofocus><Close class="size-5" aria-hidden="true" /></button>
```

Current dismissal at line 55:

```ts
close.addEventListener("click", () => dialog.close());
```

The component already implements Escape dismissal, Tab wrapping, backdrop dismissal, and focus restoration on `close`. Preserve those behaviors.

## Target

Only primary pointer presses (mouse left button, touch, pen tip) animate the inner SVG. Keyboard activation must never start this feedback.

| State                        | Transform     | Opacity | Transition                                   |
| ---------------------------- | ------------- | ------- | -------------------------------------------- |
| Rest                         | `scale(1)`    | `1`     | `0ms`                                        |
| Pointer held, normal motion  | `scale(0.96)` | `1`     | `transform 100ms cubic-bezier(0, 0, 0.2, 1)` |
| Pointer held, reduced motion | `scale(1)`    | `0.85`  | `opacity 100ms cubic-bezier(0, 0, 0.2, 1)`   |
| Release/cancel/leave         | `scale(1)`    | `1`     | `0ms`                                        |

Delay is always `0ms`; origin is center. A short tap need not reach the full scale: never wait for the animation to finish. Click invokes `dialog.close()` synchronously. No close or focus-return animation is added. No hover animation is added, so hover/pointer media gating is unnecessary; touch must remain eligible for pointer-down feedback.

The curve is the repository's existing Tailwind `--ease-out` value, verified in `node_modules/tailwindcss/theme.css:435`. Preserve this previously selected project recipe rather than changing the shared token to the audit playbook's generic strong ease-out curve. The 100ms duration and 0.96 scale fit the playbook's press budgets. Release snaps immediately for asymmetric press/response timing.

## Repo conventions to follow

- Astro component with plain DOM event listeners; no animation library.
- `/Users/caven/workspace/caven/projects/caven.me/README.md:56` requires Tailwind utilities for interaction states.
- Existing exemplar: `ProjectImage.astro:16` uses `motion-safe:transition-transform`, duration utilities, `ease-out`, and group states.
- Reuse the imported `Close` Pikaicons SVG. Keep `aria-hidden="true"`, localized button label, autofocus, and `size-11` target.
- Tests belong in `/Users/caven/workspace/caven/projects/caven.me/tests/project-image.test.ts`.

## Steps

1. Add browser regressions before implementation at the existing project-image seam. Open the actual dialog, hold the primary pointer over its close button, and sample computed SVG transform/opacity. Verify held-state feedback, reduced motion, cancellation cleanup, and no feedback when Space is held. Run the focused file and confirm the new pointer-feedback assertions fail on the stamped commit.
2. Add a named Tailwind group `group/close` to the button. Use a boolean `data-pointer-pressed` attribute as the sole pressed-state source; do not use `:active`, because Space also activates that pseudo-class. Give the SVG these complete utility classes:

   ```text
   size-5 origin-center [transform:scale(1)] opacity-100 duration-0 ease-out
   motion-safe:transition-transform motion-reduce:transition-opacity
   group-data-[pointer-pressed]/close:duration-100
   motion-safe:group-data-[pointer-pressed]/close:[transform:scale(.96)]
   motion-reduce:group-data-[pointer-pressed]/close:opacity-85
   ```

3. In the existing per-figure script, add a small local clear function that removes `data-pointer-pressed`. On the close button's `pointerdown`, set the attribute only when `event.isPrimary && event.button === 0`. Add clearing listeners for `pointerup`, `pointercancel`, `pointerleave`, `lostpointercapture`, and `blur`. Clear on button `keydown` as well so mixed pointer/keyboard interaction cannot retain motion. Do not call `preventDefault`, stop propagation, or capture the pointer: preserve native focus, touch scrolling, and click hit-testing.
4. Clear the pressed state on the dialog's `close` event before its existing focus-restoration call. Keep the existing click listener exactly synchronous. No timers, `requestAnimationFrame` state loop, `transitionend` dependency, or delayed close. Leaving the button cancels feedback; re-entering during the same held press does not restart it.
5. Run focused checks, then the complete test suite. Inspect real mouse and touch behavior. Record results in the executor's delivery summary.

## Boundaries

- Only modify `src/components/ProjectImage.astro` and `tests/project-image.test.ts` for implementation.
- No changes to preview entrance, backdrop, thumbnail hover, project spacing, navigation, favicon, or global motion tokens.
- Do not animate the button box, label, layout, border, or background. Do not add dependencies or change Pikaicons paths.
- Do not modify the existing keyboard-open animation as part of this plan. The keyboard requirement here is no new close-button feedback or dismissal delay.
- If the cited structure has materially changed since commit 277e6c4, stop and report the mismatch instead of guessing.

## Verification

Run from `/Users/caven/workspace/caven/projects/caven.me`:

```sh
pnpm exec astro preview stop
pnpm exec vp run test tests/project-image.test.ts
pnpm exec vp run typecheck
pnpm exec vp run lint
pnpm exec vp run format:check
pnpm exec vp run test
pnpm exec vp run preview --host 127.0.0.1 --port 4321
```

Do not overlap preview and Playwright's server on port 4321. A 'no preview running' response to the stop command is harmless. Apply formatting only to implementation changes if the format check fails.

### Mechanical acceptance

- Test both English and Chinese routes using the existing localized button names.
- With normal motion, mouse down and hold: SVG reaches `scale(0.96)`, computed transition duration is `0.1s`, opacity stays 1, and the button remains 44×44px.
- Release inside: dialog closes and focus returns to its trigger. Instrument the click dispatch locally in the test to assert `dialog.open === false` immediately after dispatch; do not rely only on an eventually-hidden assertion. Keep real mouse activation coverage too.
- Space down on focused close button: SVG remains at scale 1 and opacity 1, with no feedback animation; Space up closes. Enter and Escape close promptly; Tab wrapping remains unchanged.
- Under reduced motion, primary pointer down changes only opacity to 0.85 over 100ms; transform remains scale 1. Keyboard input still causes no feedback.
- Mouse down then drag outside and release: no stuck scale/opacity and no delayed close. Test `pointercancel` and reopening after dismissal. Test cancellation events synthetically only where the browser automation API lacks a real equivalent; identify that limit in results.
- Right mouse button and non-primary pointers never start feedback. A cancelled touch gesture must not activate close.
- Existing no-JavaScript original-image fallback still passes.

### Feel check

- At normal speed, tap close quickly: it must feel immediate, not like a 100ms countdown.
- In DevTools Animations, slow playback to 10% and hold/release: only the inner icon shrinks, the target never moves, and release snaps back without a closing animation. Restore normal playback afterward.
- Toggle reduced-motion emulation: hold with a pointer and confirm gentle opacity feedback, no shrinking.
- Check a real touch device if available: tap, drag away, and cancel a gesture. If unavailable, explicitly report emulation-only touch evidence.

**Done when** all mechanical checks pass and normal-speed close feels immediate, with no keyboard-induced press animation or stuck state after cancellation. Completion is not dependent on observing a full 0.96 scale during a quick click.

## Execution result

Implemented from isolated worktree commit `a2c4e61`. Animation review: APPROVE. All 100 browser tests, Astro checking, lint and formatting passed. Pointer regressions were red before implementation. Browser frame sampling at 50ms measured scale 0.96643 with a 44×44px target. Keyboard activation and synchronous dismissal passed; CDP touch cancellation and tap passed. Touch evidence is emulation-only; no real touch device was available.
