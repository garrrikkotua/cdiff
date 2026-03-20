---
name: cdiff
version: 0.1.0
description: |
  Open a browser-based diff viewer showing all current changes in a VS Code-style
  file tree with syntax-highlighted diffs. Live-reloads as files change.
  Use when the user wants to "see the diff", "show changes", "what did I change",
  or "open diff viewer".
allowed-tools:
  - Bash
  - Read
---

# /cdiff — Browser Diff Viewer

Opens a live-updating browser dashboard showing your current git diff.

## Usage

Locate the cdiff install directory, then run:

```bash
_CDIFF=""
[ -d "${CLAUDE_SKILL_DIR}/../src" ] && _CDIFF="${CLAUDE_SKILL_DIR}/.."
[ -z "$_CDIFF" ] && [ -d ~/.claude/skills/cdiff-viewer/src ] && _CDIFF=~/.claude/skills/cdiff-viewer
[ -z "$_CDIFF" ] && [ -d .claude/skills/cdiff-viewer/src ] && _CDIFF=.claude/skills/cdiff-viewer
echo "CDIFF_DIR: $_CDIFF"
```

Run cdiff to show working directory changes:

```bash
bun run "$_CDIFF/src/cli.ts"
```

To compare branches:

```bash
bun run "$_CDIFF/src/cli.ts" main..HEAD
```

Tell the user: "cdiff is running — check your browser. Press Ctrl+C in the terminal when done."

The viewer shows:
- File tree sidebar with change indicators (M/A/D/R)
- Syntax-highlighted unified or side-by-side diffs
- Staged vs unstaged toggle
- Dark/light theme
- Live auto-refresh as files change
