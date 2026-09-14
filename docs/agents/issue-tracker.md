# Issue tracker: GitHub

Tasks and specifications for this repository live in GitHub Issues. Use the `gh` CLI for operations.
Run commands from the repository directory so `gh` infers the target repository from the Git remote.

## Common operations

- Create: `gh issue create --title "..." --body-file <file>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body-file <file>`
- Add a label: `gh issue edit <number> --add-label "<label>"`
- Remove a label: `gh issue edit <number> --remove-label "<label>"`
- Close: `gh issue close <number>`

Write multiline bodies to a temporary file and pass it with `--body-file`.
Use `--label` and `--state` filters as needed.

When a skill says "publish to the issue tracker", create a GitHub issue.
When a skill says "fetch the relevant ticket", read the corresponding issue and its comments.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding

When using Wayfinder:

- Map: use an issue labelled `wayfinder:map` to hold Notes, Decisions-so-far, and Fog.
- Child tickets: prefer GitHub sub-issues. If unavailable, use a task list in the map and place `Part of #<number>` at the top of each child.
- Type labels: `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- Blocking: prefer GitHub native issue dependencies. If unavailable, place `Blocked by: #<number>` at the top of the ticket.
- Frontier: in map order, choose an open child with no open blockers and no assignee.
- Claim: `gh issue edit <number> --add-assignee @me`.
- Resolve: publish the conclusion, close the ticket, and add a summary and link to the map's Decisions-so-far.
