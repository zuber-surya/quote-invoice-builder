---
name: new-sprint
description: Set up the next sprint from docs/Sprint Plan.md — create its GitHub milestone and issues, create and check out its feature branch, and seed the task list. Use when the user says "start the next sprint", "start Sprint N", or "move to next" after a sprint has shipped.
---

# New Sprint

Automates the setup ritual repeated manually for Sprints 6, 7, and 8 of this project:
read the plan, stand up GitHub tracking, create a branch, seed tasks. Stops short of
implementing anything — that's a separate step the user asks for explicitly afterward.

## When to use

- User says "start Sprint N", "start the next sprint", "move to next", or similar, and
  the previous sprint's PR is merged (or the user explicitly says to proceed anyway).
- Do NOT use this to also implement the sprint — this skill only does setup. Confirm
  with the user before writing any application code.

## Steps

1. **Confirm the previous sprint is actually done.** Run `git status --short` and
   `git branch --show-current`. If there's an open, unmerged PR for the current branch,
   ask the user whether to merge it first (mirror the pattern used for Sprints 6/7/8 —
   this project has consistently merged before starting the next sprint, but always
   confirm rather than merging unasked).

2. **Read `docs/Sprint Plan.md`.** Find the next sprint in the Sprint Status table (marked
   🔵 Next, or the first ⬜ Not started row if the table hasn't been advanced yet). Read
   its full section for the task breakdown — if the sprint only has a one-line scope note
   ("Later Sprints" section), that's fine; break it into a task list yourself following
   the same granularity used for prior sprints (Sprint 6 got ~11 fine-grained issues,
   Sprints 7/8 got ~4-5 coarser ones — match to how much genuine sub-structure the work
   has, don't force artificial splits).

3. **Sync and branch.**
   ```
   git checkout main
   git pull --ff-only origin main
   git checkout -b feature/<slug>
   ```
   Derive `<slug>` from the sprint's theme (e.g. `quotes-calc-api`, `invoices-conversion`),
   matching the `feature/*` convention already used.

4. **Create the GitHub milestone**, if one doesn't already exist for this sprint:
   ```
   gh api repos/:owner/:repo/milestones -f title="Sprint N: <Name>" -f description="..." -f state="open"
   ```
   Check `gh api repos/:owner/:repo/milestones` first to avoid creating a duplicate if
   this sprint was already partially set up.

5. **Create one GitHub issue per task**, linked to the milestone:
   ```
   gh issue create --title "<task>" --milestone "Sprint N: <Name>" --body "<task detail + doc references>"
   ```
   Each issue body should cite the relevant doc section(s) (PRD/API Spec/DB Design/UI-UX
   Spec), same as every prior sprint's issues.

6. **Seed the task list** with `TaskCreate`, one task per issue created in step 5, plus a
   final "Verify, commit, push, open PR" task (use the `verify-and-ship` skill for that
   step when the sprint's implementation is done).

7. **Update `docs/Sprint Plan.md`**: change the just-started sprint's Sprint Status table
   row from ⬜/🔵 to 🔵 Next (or if a prior 🔵 sprint exists, move that to ✅ Done and mark
   this one 🔵), and mark the previous sprint's row ✅ Done if it wasn't already.

8. **Report back**: branch name, milestone URL, issue list, and ask whether to proceed
   with implementation now or stop here.

## What this skill does NOT do

- Does not write any application code.
- Does not merge PRs.
- Does not decide sprint scope on its own — if `docs/Sprint Plan.md` doesn't have enough
  detail for the next sprint (e.g. it's still just a one-line "Later Sprints" bullet with
  real ambiguity), ask the user clarifying questions before creating issues, rather than
  guessing at scope.
