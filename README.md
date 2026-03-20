# cdiff

Browser-based git diff viewer for AI coding workflows. See what changed without opening VS Code.

![cdiff](https://img.shields.io/badge/version-0.1.0-blue)

## Why

When using AI coding agents (Claude Code, Codex) in the terminal, you make changes across many files but have no lightweight way to see the full picture. `git diff` is hard to scan. Opening VS Code/Cursor just to glance at changes is a context-switch tax.

cdiff opens a browser dashboard with a VS Code-style file tree and syntax-highlighted diffs. It live-reloads as files change.

## Install

Requires [Bun](https://bun.sh):

```bash
# Install Bun (if you don't have it)
curl -fsSL https://bun.sh/install | bash

# Clone and run
git clone https://github.com/garrrikkotua/cdiff.git
cd cdiff
bun install
```

## Usage

```bash
# View working directory changes
bun run src/cli.ts

# Compare branches
bun run src/cli.ts main..HEAD

# Custom port
bun run src/cli.ts --port 4000
```

The browser opens automatically. Press `Ctrl+C` to stop.

### As a global command

```bash
# Link globally
bun link

# Now use from any repo
cdiff
cdiff main..feature-branch
```

### As a Claude Code skill

Copy the `skill/` directory to your Claude Code skills:

```bash
cp -r skill ~/.claude/skills/cdiff
```

Then use `/cdiff` in Claude Code to open the diff viewer.

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
