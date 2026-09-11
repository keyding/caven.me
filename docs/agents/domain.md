# Domain docs

This repository uses a single-context layout:

- `CONTEXT.md` at the repository root holds domain terminology and context.
- `docs/adr/` holds architecture decision records.

## Read before exploring

Read the root `CONTEXT.md` and any ADRs relevant to the current work.

If these files do not exist, proceed silently. The `domain-modeling` skill creates them
as needed when terminology or decisions are actually resolved.

## Use domain terminology

Use the terms defined in `CONTEXT.md` in issue titles, design proposals, diagnostic
hypotheses, and test names. Stay consistent with the glossary.

When a concept is undefined, first check for an existing equivalent term.
If there is a real gap, record it as follow-up input for `domain-modeling`.

## Decision conflicts

When a proposal conflicts with an existing ADR, identify the ADR and explain why
the decision should be revisited before handling the decision change.
