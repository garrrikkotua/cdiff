# TODOS

## P2: Image diff support
Show side-by-side visual comparison for image files (PNG, SVG, etc.) instead of
"Binary file changed" placeholder.
**Why:** Makes cdiff useful for frontend/design work, not just code changes.
**Context:** Requires reading binary files from git and base64 encoding them for
inline display. GitHub does this well — use as reference. Accepted in CEO review,
deferred from v1.
**Effort:** M (human) → S (with CC)
**Depends on:** Core diff viewer

## P3: FS watcher polling fallback
When `fs.watch` fails (ENOSPC on Linux, or unsupported FS), fall back to polling
`git diff --name-status` every 2 seconds.
**Why:** Linux has a default inotify watch limit (~8192). Large repos or users
running many tools can exhaust it. Without fallback, live reload silently breaks.
**Context:** Implement in `watcher.ts` — catch ENOSPC/ENOENT errors from fs.watch,
switch to setInterval polling. Log a console message: "Live reload: using polling (2s)".
**Effort:** S (human: ~1hr / CC: ~3min)
**Depends on:** Core watcher implementation

## P3: Keyboard navigation
Arrow keys to navigate file tree, `j/k` vim-style, `Enter` to select file,
`u/s` to toggle unified/split, `d` for dark/light.
**Why:** Power users (the target audience) expect keyboard shortcuts in dev tools.
**Context:** Add keydown event listener in the main JS. File tree needs focus
management and aria-activedescendant for accessibility.
**Effort:** S (human: ~2hrs / CC: ~5min)
**Depends on:** Core UI working
