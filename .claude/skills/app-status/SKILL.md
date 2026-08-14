---
name: app-status
description: Report current project status — sprint/milestone progress, merged vs open PRs, and current branch/working-tree state. Use when the user asks "what's the status", "where are we", "app status", "sprint status", or "what's next".
---

# App Status

Pulls a status snapshot from the sources of truth — no memory, no guessing.

## Steps

1. **Read `docs/Sprint Plan.md`** — the Sprint Status table at the top. This is the
   milestone/sprint checklist (V1 MVP, sprints 1–13). Note any row whose status looks
   stale (e.g. still "🔵 Next" for a sprint whose PR is already merged) — flag it, don't
   silently trust the table over git/GitHub reality.

2. **Cross-check against GitHub**, if `gh` is available and a remote is configured:
   ```
   gh pr list --state all --limit 10
   ```
   Confirms which sprint PRs actually merged, and whether anything is still open.

3. **Check local git state**:
   ```
   git branch --show-current
   git status --short
   git log --oneline -5
   ```
   Reports current branch, whether it's ahead/behind/in sync with its merged work, and
   any uncommitted or untracked files worth flagging (scratch files, in-progress work).

4. **Report back**, in this shape:
   - Milestone name and overall sprint count (done / next / not started / backlog).
   - The next unstarted sprint, and what it covers (one line from the plan doc).
   - Any discrepancy between the plan doc's table and actual merged PRs.
   - Current branch + whether working tree is clean.
   - Do NOT propose or take action (no branch switches, no doc edits) unless asked —
     this skill is read-only reporting.

## What this skill does NOT do

- Does not update `docs/Sprint Plan.md` (that's `new-sprint`'s job when starting a sprint).
- Does not create branches, issues, or milestones (see `new-sprint`).
- Does not run tests/lint/build (see `verify-and-ship`).
