# cdiff

Browser-based git diff viewer for AI coding workflows. See what changed without opening VS Code.

## Why

When using AI coding agents (Claude Code, Codex) in the terminal, you make changes across many files but have no lightweight way to see the full picture. `git diff` is hard to scan. Opening VS Code/Cursor just to glance at changes is a context-switch tax.

cdiff opens a browser dashboard with a VS Code-style file tree and syntax-highlighted diffs. It live-reloads as files change.

## Install as a Claude Code skill

**Step 1: Install globally**

Open Claude Code and run:

```
git clone https://github.com/garrrikkotua/cdiff.git ~/.claude/skills/cdiff-viewer && cd ~/.claude/skills/cdiff-viewer && ./setup
```

Then add to your `CLAUDE.md`:

```markdown
## cdiff
Available skills: /cdiff
```

**Step 2: Add to your project (optional)**

To share cdiff with teammates so they get it automatically:

```
cp -Rf ~/.claude/skills/cdiff-viewer .claude/skills/cdiff-viewer && rm -rf .claude/skills/cdiff-viewer/.git && cd .claude/skills/cdiff-viewer && ./setup
```

## Install standalone

If you just want the CLI without the Claude Code skill:

```bash
# Requires Bun (https://bun.sh)
git clone https://github.com/garrrikkotua/cdiff.git
cd cdiff
bun install
```

## Usage

### Claude Code

Just type `/cdiff` in Claude Code. It opens the browser dashboard automatically.

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

### Global command

```bash
bun link
cdiff
cdiff main..feature-branch
```

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
