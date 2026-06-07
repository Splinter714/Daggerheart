---
name: task
description: Create or link a GitHub issue for the current worktree session's work. Use this at the start of any new worktree session, or whenever the user wants to track what they're working on in GitHub — even if they don't say "/task" explicitly. Triggers on phrases like "create an issue for this", "make a gh issue", "track this in github", "new issue", "open an issue", or when starting a fresh worktree session and no issue is linked yet.
---

## What this skill does

Links the current worktree branch to a GitHub issue — finding an existing one if it matches, or creating a new one if not.

---

## Steps

### 1. Understand the current work

Gather context to figure out what's being worked on:

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main --stat
```

Also read the conversation context — the user may have described the work already.

### 2. Check for an existing matching issue

List open issues and see if any already describe this work:

```bash
gh issue list --state open --limit 50
```

Scan titles and (if needed) bodies for a match. A match means the issue clearly describes the same feature, bug, or task — not just a vague overlap.

**If a clear match exists**: use `AskUserQuestion` with **"Link to #N: \<title\>"** / **"Create a new issue instead"** before proceeding.

**If the intent isn't clear** from the branch name and commits alone (e.g. the branch name is generic or there are no commits yet): use `AskUserQuestion` to clarify the goal — offer 2–3 likely interpretations you can infer from context, plus **"Something else"** so the user can type it.

**If nothing matches**: proceed to create a new issue.

### 3a. If linking — link and report

```bash
gh issue develop <issue-number> --branch <current-branch> --base main
```

If that command isn't available (older gh CLI), just report the issue URL so the user can see it.

### 3b. If creating — confirm draft before creating

Draft a concise title and short description based on what the branch + git log + conversation context reveal. Keep the title tight (under 70 chars). The description should be 2–4 bullet points of what's being changed and why — no fluff.

Before running `gh issue create`, use `AskUserQuestion` to confirm: **"Create with this title: \<drafted title\>"** / **"Edit the title first"**. This gives the user a chance to redirect without typing unless they want to.

```bash
gh issue create --title "<title>" --body "$(cat <<'EOF'
<description>
EOF
)"
```

After creating, link the branch:

```bash
gh issue develop <new-issue-number> --branch <current-branch> --base main
```

### 4. Report back

Tell the user:
- The issue number and title
- Whether it was found or created
- The URL so they can click through

Keep it to 2–3 lines. No extra commentary.
