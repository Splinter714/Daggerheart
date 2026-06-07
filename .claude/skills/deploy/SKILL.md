---
name: deploy
description: Deploy the Daggerheart GM Dashboard to GitHub Pages with a version bump. Use whenever the user wants to publish a new release, push to production, increment the version, or deploy the app — even if they don't say "/deploy". Triggers on phrases like "deploy", "release", "push to pages", "bump version", "publish", "ship to prod".
---

## What this skill does

Publishes a new versioned release to GitHub Pages:

1. Review branch and repo state
2. Confirm main is clean and up-to-date
3. Bump the version in `package.json`
4. Commit the version bump
5. Run `npm run deploy` (builds then pushes to gh-pages)
6. Confirm the deployment

---

## Step-by-step

### 1. Review state

Run these to get a picture of where things stand:

```bash
git status
git log --oneline -10
git branch -a
git fetch origin
git log origin/gh-pages..HEAD --oneline   # commits not yet on gh-pages
```

Show the user a brief summary:
- Current branch and any uncommitted changes
- Commits on main that haven't been deployed yet
- Whether main is ahead/behind origin/main
- Any stale branches worth noting

If there are uncommitted changes on main, use `AskUserQuestion` with options **"Stash them"** / **"Commit them first"** / **"Stop — I'll handle it"**.

### 2. Confirm main is ready

You should be on main with a clean working tree before deploying. If not, resolve it with the user before continuing.

```bash
git checkout main
git pull origin main
```

### 3. Bump the version

Unless the user already specified the increment, read the current version from `package.json`, then use `AskUserQuestion` with options **"Patch (bug fixes / small tweaks)"** / **"Minor (new features)"** / **"Major (big redesign / breaking)"**, showing the current version and what each would bump it to.

| Type  | When to use                        | Example       |
|-------|------------------------------------|---------------|
| patch | bug fixes, small tweaks            | 0.5.4 → 0.5.5 |
| minor | new features, visible improvements | 0.5.4 → 0.6.0 |
| major | breaking changes, big redesigns    | 0.5.4 → 1.0.0 |

Edit `package.json` to update the `"version"` field.

### 4. Commit the version bump

```bash
git add package.json
git commit -m "chore: bump version to <new-version>"
git push origin main
```

### 5. Deploy

```bash
npm run deploy
```

This runs `predeploy` (builds) then pushes `./dist` to the `gh-pages` branch. Watch for build errors — if the build fails, fix before retrying. Do not push a broken build.

### 6. Confirm

After deploy completes, report:
- New version number
- URL: https://splinter714.github.io/Daggerheart
- The gh-pages branch is now updated

Tell the user it may take a minute for GitHub Pages to reflect the change.

---

## Edge cases

- **Build fails**: stop, report the error, don't push. Fix the build issue first.
- **Uncommitted changes**: don't deploy over uncommitted work — resolve with the user.
- **Already on this version**: double-check `package.json` wasn't already bumped in a previous run.
