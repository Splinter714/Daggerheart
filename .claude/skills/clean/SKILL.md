---
name: clean
description: Audit local and remote git state for anything dangling after a work session — unmerged branches, unpushed commits, stale remotes, uncommitted changes — then summarize and optionally clean up. Use after finishing a batch of work, or whenever the user wants to tidy up the repo. Triggers on phrases like "clean up", "tidy up", "anything dangling", "check the repo state", "what branches are left", "anything out of sync", "housekeeping".
---

## What this skill does

Gives you a clear picture of repo state after a work session, flags anything that looks like leftover debris, and cleans it up with your approval.

---

## Step-by-step

### 1. Fetch and gather state

```bash
git fetch --prune origin
git status
git branch -vv
git log origin/main..HEAD --oneline        # unpushed commits on main
git branch --merged main                   # branches already merged into main
git branch --no-merged main                # branches NOT yet merged into main
git remote prune origin --dry-run          # stale remote-tracking refs
```

### 2. Summarize

Present a compact state report covering these categories. Only show categories where something is actually present — skip the empty ones.

**Uncommitted changes** — any modified/untracked files on the current branch

**Unpushed commits** — commits on main (or current branch) not yet on origin

**Merged branches** — local branches already merged into main (safe to delete)

**Unmerged branches** — local branches with work not yet in main (needs attention)

**Stale remote refs** — remote-tracking branches whose upstream is gone

Example summary format:
```
Repo state after session
────────────────────────
✓ Working tree clean
✓ main is up to date with origin/main

⚠ Merged branches (safe to delete): feature/nav-rail, fix/card-overflow
⚠ Stale remote refs: origin/fix/old-thing

ℹ Unmerged branches: feature/wip-experiment
  └ 3 commits ahead of main — not yet merged
```

### 3. Ask before cleaning

After the summary, use `AskUserQuestion` with options **"Yes, clean it up"** / **"No, leave it"** to ask if the user wants to delete merged branches and prune stale refs.

If yes, proceed with cleanup. If no, stop — just leave the report.

For **unmerged branches**, ask individually using `AskUserQuestion` — include the branch name and commit summary in the question text, and offer **"Delete it"** / **"Keep it"**. Never delete them automatically.

### 4. Clean up (with approval)

**Delete merged local branches:**
```bash
git branch -d <branch>   # for each merged branch (skip main)
```

**Delete merged remote branches** (only if the remote branch still exists):
```bash
git push origin --delete <branch>
```

**Prune stale remote refs:**
```bash
git remote prune origin
```

**For unmerged branches the user wants to drop:**
```bash
git branch -D <branch>                  # local
git push origin --delete <branch>       # remote (if exists)
```

### 5. Final confirmation

After cleanup, run `git branch -a` and report the clean state. Keep it short.

---

## Edge cases

- **Never delete main** — skip it in all branch operations, even if it appears in `--merged` output.
- **Worktree branches**: if a branch is checked out in an active worktree, `git branch -d` will fail — note it and skip rather than forcing.
- **Unpushed commits on main**: flag these prominently and use `AskUserQuestion` with **"Push now"** / **"Leave it"** — don't push automatically.
- **Nothing to clean**: just report "Repo looks clean" and stop.
