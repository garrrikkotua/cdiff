# Design System — cdiff

## Product Context
- **What this is:** Lightweight browser-based git diff viewer for AI coding workflows
- **Who it's for:** Developers using AI coding agents (Claude Code, Codex) who need a quick visual overview of changes without opening a full IDE
- **Space/industry:** Developer tools, terminal utilities
- **Project type:** Local dev tool / dashboard

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian
- **Decoration level:** Minimal — typography and color do all the work. No shadows, no gradients, no rounded corners on panels.
- **Mood:** Fast, terminal-adjacent, function-first. Should feel like a refined terminal, not a web app. No polish for polish's sake.
- **Reference sites:** GitHub dark diff view (color conventions), Sublime Merge (density), VS Code source control (file tree pattern)

## Typography
- **Code/Diff:** JetBrains Mono — best OSS monospace font, ligatures, tabular-nums. The soul of the tool.
- **UI/Labels:** Geist Sans — Vercel's font, designed for developer tools, clean at small sizes.
- **Data/Tables:** JetBrains Mono (tabular-nums)
- **Loading:** Bundled into binary (offline-first). Fallback: `'SF Mono', 'Consolas', monospace` for code, `-apple-system, BlinkMacSystemFont, sans-serif` for UI.
- **Scale:**
  - 11px — tertiary labels, metadata
  - 12px — code/diff lines, file names, badges
  - 13px — body text, secondary labels
  - 14px — section headers
  - 18px — page headers
  - 28px — hero (rarely used)

## Color

### Dark Mode (Primary)
- **Approach:** Restrained — one accent + diff semantics + neutrals
- **Background primary:** `#0D1117`
- **Background surface:** `#161B22` (sidebar, panels)
- **Background elevated:** `#1C2128` (hover states, dropdowns)
- **Border:** `#30363D`
- **Text primary:** `#E6EDF3`
- **Text secondary:** `#8B949E`
- **Text tertiary:** `#484F58`
- **Accent:** `#6C9EFF` (selected file, active tab, links)
- **Accent dim:** `#6C9EFF20` (hover backgrounds, selection backgrounds)
- **Addition background:** `#2EA04322` / **Addition text:** `#3FB950`
- **Deletion background:** `#F8514922` / **Deletion text:** `#F85149`
- **Warning background:** `#D2992220` / **Warning text:** `#D29922`

### Light Mode
- **Background primary:** `#FFFFFF`
- **Background surface:** `#F6F8FA`
- **Background elevated:** `#FFFFFF`
- **Border:** `#D1D9E0`
- **Text primary:** `#1F2328`
- **Text secondary:** `#656D76`
- **Text tertiary:** `#8C959F`
- **Accent:** `#0969DA`
- **Accent dim:** `#0969DA15`
- **Addition background:** `#DAFBE1` / **Addition text:** `#1A7F37`
- **Deletion background:** `#FFEBE9` / **Deletion text:** `#CF222E`
- **Warning background:** `#FFF8C5` / **Warning text:** `#9A6700`

### Theme Detection
- Default: dark mode
- Auto-detect via `prefers-color-scheme`
- Manual toggle, persisted in `localStorage`

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 2px(2xs) 4px(xs) 8px(sm) 12px(md) 16px(lg) 24px(xl) 32px(2xl)

## Layout
- **Approach:** Grid-disciplined
- **Structure:** Fixed sidebar (240px) + fluid diff panel
- **Max content width:** None (fills viewport — it's a tool, not a reading experience)
- **Border radius:** 0px everywhere — sharp corners reinforce terminal/industrial feel
- **Borders:** 1px solid, low-opacity. Subtle separation without decoration.

## Motion
- **Approach:** Minimal-functional
- **Easing:** ease-out for all transitions
- **Duration:** 150ms for tab switches, hover states, theme toggle
- **No entrance animations, no scroll effects, no loading spinners** (use skeleton states if needed)
- Speed is the brand.

## Component Patterns

### File Tree Item
- Monospace font, 12px
- Badge (M/A/D/R) left-aligned, color-coded
- Selected state: accent-dim background + accent text
- Hover state: elevated background

### Diff Line
- Monospace font, 12px, 20px line-height
- Line numbers: tertiary color, right-aligned, 48px column
- Addition: green-tinted background, + prefix in green
- Deletion: red-tinted background, - prefix in red
- Context: secondary color

### Tabs
- UI font, 12px, bottom-border active indicator (accent color)
- No background change on active — just the border

### Buttons
- Primary: accent background, white text
- Secondary: transparent, border, primary text
- Ghost: transparent, accent text, accent-dim on hover

### Badges
- Monospace font, 11px, tinted background matching semantic color

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-20 | Initial design system | Industrial/utilitarian aesthetic for terminal-adjacent dev tool. Based on competitive research of GitHub, Sublime Merge, Kaleidoscope, Fork. |
| 2026-03-20 | No border-radius | Sharp corners reinforce terminal identity. Risk: unusual for web, but deliberate. |
| 2026-03-20 | Geist Sans over system font | Purpose-built for dev tools, subtle personality, 20KB cost acceptable. |
| 2026-03-20 | Bundle fonts in binary | Offline-first. No CDN dependency for a local dev tool. |
| 2026-03-20 | GitHub dark palette for neutrals | Proven at scale, familiar to target audience, excellent contrast ratios. |
