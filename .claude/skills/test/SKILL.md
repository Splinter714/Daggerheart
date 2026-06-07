---
name: test
description: Verify the current session's changes work correctly, then commit, close the GitHub issue, and merge to main. Use when the user wants to verify and land their work — triggered by phrases like "test this", "verify and commit", "check it works then merge", "does this look right", "verify the fix", "test and ship", or after implementing a feature and wanting to confirm it before landing.
---

## What this skill does

Verifies the current session's changes are correct, then lands them:

1. Build check — catch syntax/reference errors before they reach the live app
2. Visual check — screenshot the running app and assess the changes
3. Commit only the task-related changes
4. Merge to main, push, close the GitHub issue

This is a verify-then-land skill. Branch cleanup and session archiving are handled separately by `/done`.

---

## Step-by-step

### 1. Build check

```bash
npm run build
```

If the build fails, **stop here**. Fix the errors and rebuild before continuing. Do not proceed to visual checks or commit with a broken build.

### 2. Visual check

The dev server should be running with hot-reload (typically at `http://localhost:5173`). If it's not running, note that — don't start it yourself, ask the user.

Use computer-use tools to:
1. Request access to the browser
2. Take a screenshot of the running app
3. Navigate to the relevant part of the UI for the changes made this session
4. Assess: does the feature/fix look correct? Are there any visual anomalies, console errors, or broken states?

Be proportional — if the change was a one-line CSS tweak, one screenshot of the affected component is enough. If it was a complex feature, check the primary flow and one edge case. Don't run an exhaustive QA pass.

Report what you saw: a brief description of the visual state and whether it matches what was intended. If something looks wrong, stop and tell the user before committing.

### 3. Identify task-related changes

Run `git diff --stat` and `git status` to see what's changed. Only stage files that are directly related to this session's task. If there are unrelated dirty files, leave them unstaged — don't commit them.

If it's unclear which files are task-related, use `AskUserQuestion` to show the candidates and let the user confirm — offer **"All of these"** / **"Let me tell you"** or list specific file groupings as options if there's a natural split.

### 4. Commit

```bash
git add <task-related files only>
git commit -m "<concise description of what changed>"
```

Commit message should describe the change, not the process (e.g. "Fix stat flicker on adversary type change", not "Verified and committed fix").

### 5. Merge to main and push

If you're already on main, just push:
```bash
git push origin main
```

If you're on a feature/worktree branch:
```bash
git checkout main
git merge <branch> --no-ff -m "Merge <branch>"
git push origin main
```

If there are merge conflicts, resolve them — don't just report them. After resolving, complete the merge.

### 6. Close the GitHub issue

```bash
gh issue close <number> --comment "Fixed in <commit-sha-or-branch>."
```

If you don't know the issue number, run `gh issue list --state open --limit 20` and use `AskUserQuestion` with the candidates as options. If there's no associated issue, skip.

### 7. Summarize

Report exactly what changed: which files, what the visual check showed, the commit hash, and the issue number closed. Keep it tight — one short paragraph.

---

## Edge cases

- **Dev server not running**: note it, skip the visual check, proceed with build-only verification. Tell the user the visual check was skipped.
- **Computer-use access denied**: same — skip visual, proceed with build check only, note it in the summary.
- **Build passes but visual looks wrong**: stop before committing, describe what looks off, let the user decide.
- **Unrelated dirty files**: leave them unstaged, mention them in the summary so the user knows they're still pending.
- **Already on main**: skip the merge step, just commit and push.
