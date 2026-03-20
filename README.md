# cdiff

Browser-based git diff viewer for AI coding workflows. See what changed without opening VS Code or Cursor.

When using AI coding agents (Claude Code, Codex) in the terminal, you make changes across many files but have no lightweight way to see the full picture. `git diff` is hard to scan. Opening a full IDE just to glance at changes is a context-switch tax.

cdiff opens a browser dashboard with a VS Code-style file tree and syntax-highlighted diffs. It live-reloads as files change.

## Install — takes 30 seconds

**Requirements:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code) or [Codex](https://github.com/openai/codex), [Git](https://git-scm.com/), [Bun](https://bun.sh/)

### Step 1: Install on your machine

Open Claude Code (or Codex) and paste this. The agent does the rest.

> Install cdiff: run **`git clone https://github.com/garrrikkotua/cdiff.git ~/.claude/skills/cdiff-viewer && cd ~/.claude/skills/cdiff-viewer && ./setup`** then add a "cdiff" section to CLAUDE.md that lists the available skill: /cdiff.

### Step 2: Add to your repo so teammates get it (optional)

> Add cdiff to this project: run **`cp -Rf ~/.claude/skills/cdiff-viewer .claude/skills/cdiff-viewer && rm -rf .claude/skills/cdiff-viewer/.git && cd .claude/skills/cdiff-viewer && ./setup`** then add a "cdiff" section to this project's CLAUDE.md that lists the available skill: /cdiff.

Real files get committed to your repo (not a submodule), so `git clone` just works.

### Standalone (without Claude Code)

```bash
git clone https://github.com/garrrikkotua/cdiff.git && cd cdiff && bun install
bun run src/cli.ts
```

## Usage

### In Claude Code

Just type `/cdiff`. It opens the browser dashboard automatically.

### CLI

```bash
# View working directory changes
bun run src/cli.ts

# Compare branches
bun run src/cli.ts main..HEAD

# Custom port
bun run src/cli.ts --port 4000
```

The browser opens automatically. Press `Ctrl+C` to stop.

## Features

- **File tree sidebar** with change indicators (M/A/D/R)
- **Unified and side-by-side** diff views
- **Staged / Unstaged / All** toggle
- **Branch comparison** (`cdiff main..HEAD`)
- **Dark / Light theme** with OS detection
- **Live reload** via SSE — changes appear automatically
- **Lazy loading** — file tree loads instantly, diffs load on click
- **Merge conflict detection** — shows warning banner when conflicts exist

## Tech

- [Bun](https://bun.sh) — runtime and HTTP server
- Vanilla HTML/CSS/JS — no framework, no build step for the UI
- Zero external dependencies at runtime

## License

MIT
