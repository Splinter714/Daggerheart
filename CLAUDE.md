# CLAUDE.md

## Verification / Branching

Always verify fixes on the branch/environment the user is actually testing (typically main with hot-reload), not just the worktree branch. Confirm a change is merged before reporting it as fixed.

## Scope / Working Style

Keep changes minimal and scoped to exactly what was requested. Do not create extra files (e.g., launch.json), fix unrequested issues, or run long verification sessions without confirming the user wants them.

## UI / Styling Conventions

For styling/highlighting work, start simple (single accent, minimal coloring) and add complexity only on request — avoid chaotic multi-color schemes and overly broad keyword matching.
