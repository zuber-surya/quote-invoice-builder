---
name: verify-and-ship
description: Run the project's Definition-of-Done checks (typecheck, lint, test, build) and the Web Development Standards code-review checklist, then commit, push, and open a PR using the project's template. Use when the user says "verify and commit", "ship this", "commit and generate PR", or after a sprint's implementation is complete.
---

# Verify and Ship

Automates the commit/PR ritual used at the end of every sprint in this project (Sprints
6, 7, 8): verify, commit, push, open PR. Does not merge — that's always a separate,
explicit user decision.

## When to use

- Implementation for a sprint/feature is complete and the user wants it committed and
  turned into a PR.
- Do NOT invoke this to merge — after the PR is open, stop and report the URL. Only merge
  if the user explicitly says so in the same turn or a later one.

## Steps

1. **Run the checks**, from `web/`:
   ```
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
   `build` matters — see `docs/Architecture Decisions.md` and the incident where `/login`
   only failed at `next build` time (missing Suspense boundary around `useSearchParams`),
   never caught by `dev`/`typecheck`/`lint`/`test`. Stop and fix root causes before
   proceeding; never skip a failing check to get to the commit step (CLAUDE.md rule 19,
   Web Dev Standards §120).

2. **Walk the review checklist** (Web Development Standards §89) against the actual diff
   (`git diff` / `git status`):
   - No unnecessary duplication
   - No inline CSS (`style={{...}}`)
   - No unnecessary `any`
   - Validation exists at the API boundary (Zod schema)
   - Authorization exists (every query scoped by `userId`, per `lib/get-current-user.ts`)
   - Error/loading/empty states exist for new UI
   - Responsive behavior considered
   - Accessibility considered (labels, focus states)
   - Tests added for new business logic
   - No secrets committed
   - No unrelated files changed

   Report anything that fails this checklist before continuing — fix it or explicitly
   flag it to the user, don't silently ship a gap.

3. **Manual/browser verification** where the change is observable (new UI, new API
   behavior) — follow the same pattern used in every prior sprint: start the dev server,
   exercise the actual flow (not just automated tests), check for console/server errors.

4. **Stage and commit.** Only the files relevant to this unit of work — split into
   multiple focused commits if the diff spans unrelated concerns (mirrors the Sprint 6
   split: feature commit separate from an unrelated lint-config fix). Conventional commit
   format (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), body explaining *why*, citing doc
   sections where relevant — match the style of prior commits (`git log --oneline -10` to
   recalibrate).

5. **Push and open the PR**:
   ```
   git push -u origin <branch>
   gh pr create --title "..." --milestone "Sprint N: ..." --body "..."
   ```
   The PR body should follow `.github/pull_request_template.md`'s shape (Summary,
   Requirements, Testing, UI, Security, Notes) and include a `Closes #N, #M, ...` line for
   every issue this sprint's milestone tracked.

6. **Report**: PR URL, what changed, what was verified, any known limitations — then stop.
   Do not merge unless explicitly told to.

## What this skill does NOT do

- Does not merge PRs.
- Does not decide to skip a failing check "just this once."
- Does not commit without running the checks first.
