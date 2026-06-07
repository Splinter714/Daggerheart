---
name: done
description: Land a completed worktree branch onto main: merge, push, verify hot-reload, close or update the GitHub issue, delete the branch (local + remote), and archive the worktree session. Use this whenever the user says they're done with a feature, a worktree session, a branch, or a GitHub issue — even if they don't say "/done" explicitly. Triggers on phrases like "I'm done", "ship it", "merge this in", "land this", "close the issue", "wrap this up", "clean up the branch".
---

## What this skill does

Lands a finished worktree branch on main and cleans everything up:

1. Merge the branch into main
2. Push main to origin
3. Prompt the user to eyeball the hot-reload environment
4. Close or update the GitHub issue
5. Delete the branch (locally and on origin)
6. Archive the worktree session

---

## Step-by-step

### 1. Identify the branch

If not obvious from context, run `git branch -a` to find the worktree branch. Confirm with the user if ambiguous.

### 2. Merge to main

```bash
git checkout main
git merge <branch> --no-ff -m "Merge <branch>"
```

If there are conflicts, resolve them — don't just report them. After resolving, complete the merge and continue.

### 3. Push to origin

```bash
git push origin main
```

### 4. Hot-reload check

Tell the user: "Main is updated — take a look at the running app and let me know if everything looks good." Wait for their confirmation before continuing. Don't assume it's fine.

### 5. GitHub issue

Ask the user (or infer from context) whether the issue is fully resolved or partially done:

- **Fully done**: close the issue with `gh issue close <number> --comment "Fixed in <branch>."`
- **Partially done**: add a comment summarizing what was done and what's left, leave the issue open. Ask the user what to note if unclear.

If you don't know the issue number, ask. If there's no associated issue, skip this step.

### 6. Delete the branch

```bash
git branch -d <branch>
git push origin --delete <branch>
```

If the local delete fails with "not fully merged" but you just merged it to main, use `-D` — the merge is already captured.

### 7. Archive the worktree session

Use `list_sessions` (mcp__ccd_session_mgmt) to find the session associated with the worktree branch. Look for a session whose name or working directory matches the branch or worktree path.

- If you find a clear match, call `archive_session` with a reason like `"Branch <branch> merged to main"`. The user will be prompted to confirm.
- If there are multiple candidates or nothing obvious, show the user the list and ask which to archive.
- If this skill is being run *from* the worktree session itself, you can't archive it directly — tell the user to archive it from the session list or switch to the main session first.

---

## Edge cases

- **No worktree session found**: skip archiving, note it.
- **Branch already deleted**: skip the delete steps.
- **Push fails**: diagnose before trying force-push. Never force-push main.
- **Issue already closed**: note it and move on.
