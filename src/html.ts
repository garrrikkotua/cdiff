export interface HtmlOptions {
  isBranchCompare: boolean;
  isMerge: boolean;
  range?: string;
}

export function renderHTML(opts: HtmlOptions): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>cdiff</title>
<style>
:root {
  --font-ui: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  --transition: 150ms ease-out;
}
[data-theme="dark"] {
  --bg: #0D1117; --bg-surface: #161B22; --bg-elevated: #1C2128;
  --border: #30363D; --text: #E6EDF3; --text-2: #8B949E; --text-3: #484F58;
  --accent: #6C9EFF; --accent-dim: #6C9EFF20;
  --add-bg: #2EA04318; --add: #3FB950;
  --del-bg: #F8514918; --del: #F85149;
  --warn-bg: #D2992220; --warn: #D29922;
}
[data-theme="light"] {
  --bg: #FFFFFF; --bg-surface: #F6F8FA; --bg-elevated: #FFFFFF;
  --border: #D1D9E0; --text: #1F2328; --text-2: #656D76; --text-3: #8C959F;
  --accent: #0969DA; --accent-dim: #0969DA15;
  --add-bg: #DAFBE1AA; --add: #1A7F37;
  --del-bg: #FFEBE9AA; --del: #CF222E;
  --warn-bg: #FFF8C5; --warn: #9A6700;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:var(--font-ui); background:var(--bg); color:var(--text); line-height:1.5; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
a { color:var(--accent); text-decoration:none; }

/* Header */
.hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; border-bottom:1px solid var(--border); background:var(--bg-surface); flex-shrink:0; }
.hdr-l { display:flex; align-items:center; gap:8px; }
.logo { font-family:var(--font-mono); font-weight:600; font-size:13px; color:var(--accent); }
.sep { color:var(--text-3); }
.meta { font-size:12px; color:var(--text-2); }
.stats .a { color:var(--add); } .stats .d { color:var(--del); }
.hdr-r { display:flex; align-items:center; gap:4px; }
.tab { padding:4px 12px; font-size:12px; color:var(--text-2); border-bottom:2px solid transparent; cursor:pointer; font-family:var(--font-ui); background:none; border-top:none; border-left:none; border-right:none; transition:all var(--transition); user-select:none; }
.tab:hover { color:var(--text); }
.tab.on { color:var(--text); border-bottom-color:var(--accent); }
.tab-sep { width:16px; }
.btn { background:var(--bg-elevated); border:1px solid var(--border); color:var(--text-2); padding:4px 10px; font-size:11px; cursor:pointer; font-family:var(--font-ui); transition:all var(--transition); }
.btn:hover { color:var(--text); border-color:var(--text-3); }

/* Warning banner */
.warn-banner { display:flex; align-items:center; gap:8px; padding:6px 16px; background:var(--warn-bg); color:var(--warn); font-size:12px; font-weight:500; border-bottom:1px solid var(--border); flex-shrink:0; }

/* Main layout */
.main { display:flex; flex:1; overflow:hidden; }

/* Sidebar */
.sidebar { width:260px; flex-shrink:0; border-right:1px solid var(--border); background:var(--bg-surface); display:flex; flex-direction:column; overflow:hidden; }
.sb-tabs { display:flex; border-bottom:1px solid var(--border); flex-shrink:0; }
.sb-tab { flex:1; padding:6px 8px; font-size:11px; font-weight:600; text-align:center; color:var(--text-3); cursor:pointer; border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:var(--font-ui); text-transform:uppercase; letter-spacing:0.5px; transition:all var(--transition); }
.sb-tab:hover { color:var(--text-2); }
.sb-tab.on { color:var(--text); border-bottom-color:var(--accent); }
.sb-content { flex:1; overflow-y:auto; }

.file-dir { padding:4px 12px; font-family:var(--font-ui); font-size:11px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:0.5px; margin-top:8px; }
.file-dir:first-child { margin-top:4px; }
.file { display:flex; align-items:center; gap:8px; padding:3px 12px; font-family:var(--font-mono); font-size:12px; color:var(--text-2); cursor:pointer; transition:background var(--transition); overflow:hidden; }
.file:hover { background:var(--bg-elevated); color:var(--text); }
.file.sel { background:var(--accent-dim); color:var(--accent); }
.badge { font-size:10px; font-weight:600; width:14px; text-align:center; flex-shrink:0; }
.badge.m { color:var(--accent); } .badge.a { color:var(--add); } .badge.d { color:var(--del); } .badge.r { color:var(--warn); }
.fpath { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.old-path { font-size:10px; color:var(--text-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Explorer tree */
.tree-item { display:flex; align-items:center; gap:4px; padding:2px 0; font-family:var(--font-mono); font-size:12px; color:var(--text-2); cursor:pointer; transition:background var(--transition); overflow:hidden; white-space:nowrap; }
.tree-item:hover { background:var(--bg-elevated); color:var(--text); }
.tree-item.sel { background:var(--accent-dim); color:var(--accent); }
.tree-icon { width:16px; text-align:center; flex-shrink:0; font-size:10px; color:var(--text-3); }
.tree-icon.dir { color:var(--accent); }
.tree-name { overflow:hidden; text-overflow:ellipsis; }
.tree-children { }

/* Content panel */
.diff-panel { flex:1; overflow:auto; }
.empty { display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-3); font-size:14px; text-align:center; }
.empty-icon { font-size:32px; opacity:0.3; margin-bottom:8px; }
.empty-sub { font-size:12px; margin-top:4px; }

/* Diff file header */
.diff-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; background:var(--bg-surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:1; }
.diff-path { font-family:var(--font-mono); font-size:12px; font-weight:500; }
.diff-stats { font-size:12px; color:var(--text-2); }

/* Unified diff */
.hunk-hdr { padding:4px 16px; color:var(--text-3); font-size:11px; font-family:var(--font-mono); background:var(--bg-surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.dl { display:flex; font-family:var(--font-mono); font-size:12px; line-height:20px; min-height:20px; }
.ln { width:48px; flex-shrink:0; text-align:right; padding-right:8px; color:var(--text-3); user-select:none; }
.dc { flex:1; padding-left:8px; white-space:pre; overflow-x:auto; }
.dl.add { background:var(--add-bg); }
.dl.add .dc::before { content:'+'; color:var(--add); margin-right:4px; }
.dl.del { background:var(--del-bg); }
.dl.del .dc::before { content:'-'; color:var(--del); margin-right:4px; }
.dl.ctx .dc::before { content:' '; margin-right:4px; }
.dl.ctx { color:var(--text-2); }
.dl.nnl { color:var(--text-3); font-style:italic; font-size:11px; padding-left:64px; }

/* Side-by-side diff */
.sbs { display:flex; }
.side { flex:1; overflow-x:auto; }
.side + .side { border-left:1px solid var(--border); }
.side-hdr { padding:4px 16px; font-size:11px; color:var(--text-3); background:var(--bg-surface); border-bottom:1px solid var(--border); font-family:var(--font-mono); }
.side .dl .ln { width:40px; }
.side .dl.pad { background:var(--bg-surface); min-height:20px; }

/* File viewer lines */
.fv-line { display:flex; font-family:var(--font-mono); font-size:12px; line-height:20px; min-height:20px; }
.fv-line .ln { width:48px; }
.fv-line .dc { color:var(--text); }
.fv-line:hover { background:var(--bg-elevated); }

/* Truncation notice */
.truncated { padding:8px 16px; color:var(--warn); font-size:12px; background:var(--warn-bg); text-align:center; }

/* Binary / special */
.special { padding:24px 16px; color:var(--text-3); font-size:13px; text-align:center; }

/* Responsive */
@media (max-width:768px) { .sidebar { width:200px; } }
</style>
</head>
<body>
<div class="hdr">
  <div class="hdr-l">
    <span class="logo">cdiff</span>
    <span class="sep">&mdash;</span>
    <span class="meta" id="file-count">loading...</span>
    <span class="meta stats" id="stats"></span>
    <span class="meta" id="live-dot" style="color:var(--add);" title="Live reload active"></span>
  </div>
  <div class="hdr-r">
    ${
      opts.isBranchCompare
        ? ""
        : `<button class="tab on" data-mode="all" onclick="setMode('all')">All</button>
    <button class="tab" data-mode="staged" onclick="setMode('staged')">Staged</button>
    <button class="tab" data-mode="unstaged" onclick="setMode('unstaged')">Unstaged</button>
    <div class="tab-sep"></div>`
    }
    <button class="tab on" data-view="unified" onclick="setView('unified')">Unified</button>
    <button class="tab" data-view="split" onclick="setView('split')">Split</button>
    <div class="tab-sep"></div>
    <button class="btn" onclick="toggleTheme()" title="Toggle theme">&#9680;</button>
  </div>
</div>
${opts.isMerge ? '<div class="warn-banner">&#9888; Merge in progress &mdash; conflict markers shown in diffs</div>' : ""}
<div class="main">
  <div class="sidebar">
    <div class="sb-tabs">
      <button class="sb-tab on" data-panel="changes" onclick="setSidebarPanel('changes')">Changes</button>
      <button class="sb-tab" data-panel="files" onclick="setSidebarPanel('files')">Files</button>
    </div>
    <div class="sb-content" id="sidebar"></div>
  </div>
  <div class="diff-panel" id="diff-panel">
    <div class="empty">
      <div>
        <div class="empty-icon">&#8230;</div>
        <div>Select a file to view</div>
      </div>
    </div>
  </div>
</div>

<script>
const IS_BRANCH = ${opts.isBranchCompare};
let currentMode = ${opts.isBranchCompare ? "'range'" : "'all'"};
let currentView = 'unified';
let sidebarPanel = 'changes';
let selectedFile = null;
let selectedBrowseFile = null;
let treeData = [];
let explorerData = null;
let expandedDirs = {};

// Theme
(function initTheme() {
  const saved = localStorage.getItem('cdiff-theme');
  if (saved) { document.documentElement.setAttribute('data-theme', saved); }
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

function toggleTheme() {
  const el = document.documentElement;
  const next = el.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  el.setAttribute('data-theme', next);
  localStorage.setItem('cdiff-theme', next);
}

// Sidebar panel
function setSidebarPanel(p) {
  sidebarPanel = p;
  document.querySelectorAll('[data-panel]').forEach(t => t.classList.toggle('on', t.dataset.panel === p));
  if (p === 'changes') {
    renderChangeTree(treeData);
  } else {
    if (!explorerData) { loadExplorer(); } else { renderExplorerTree(explorerData); }
  }
}

// Mode & view
function setMode(m) {
  currentMode = m;
  document.querySelectorAll('[data-mode]').forEach(t => t.classList.toggle('on', t.dataset.mode === m));
  refreshTree();
}

function setView(v) {
  currentView = v;
  document.querySelectorAll('[data-view]').forEach(t => t.classList.toggle('on', t.dataset.view === v));
  if (selectedFile) loadDiff(selectedFile);
}

// Escaping
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  return s.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");
}

// === CHANGES PANEL ===
async function refreshTree() {
  try {
    const r = await fetch('/api/tree?mode=' + currentMode);
    const data = await r.json();
    treeData = data.files;
    if (sidebarPanel === 'changes') renderChangeTree(data.files);
    document.getElementById('file-count').textContent = data.files.length + ' file' + (data.files.length !== 1 ? 's' : '') + ' changed';
    document.getElementById('stats').innerHTML = data.stats.additions ? '<span class="a">+' + data.stats.additions + '</span> <span class="d">-' + data.stats.deletions + '</span>' : '';
    if (sidebarPanel === 'changes' && selectedFile) {
      const still = data.files.find(f => f.path === selectedFile);
      if (!still) { selectedFile = null; showEmpty(); }
      else loadDiff(selectedFile);
    } else if (sidebarPanel === 'changes' && data.files.length === 0) {
      showEmptyClean();
    }
  } catch(e) { console.error('tree fetch failed', e); }
}

function showEmpty() {
  document.getElementById('diff-panel').innerHTML = '<div class="empty"><div><div class="empty-icon">&#8230;</div><div>Select a file to view</div></div></div>';
}
function showEmptyClean() {
  document.getElementById('diff-panel').innerHTML = '<div class="empty"><div><div class="empty-icon">&#10004;</div><div>Working tree clean</div><div class="empty-sub">No uncommitted changes</div></div></div>';
}

function renderChangeTree(files) {
  const sb = document.getElementById('sidebar');
  if (files.length === 0) { sb.innerHTML = '<div style="padding:16px;color:var(--text-3);font-size:12px;">No changes</div>'; return; }
  const dirs = {};
  for (const f of files) {
    const parts = f.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
    if (!dirs[dir]) dirs[dir] = [];
    dirs[dir].push(f);
  }
  let html = '';
  for (const [dir, dfiles] of Object.entries(dirs)) {
    if (dir !== '.') html += '<div class="file-dir">' + esc(dir) + '/</div>';
    for (const f of dfiles) {
      const name = f.path.split('/').pop();
      const s = f.status.toLowerCase();
      const cls = selectedFile === f.path ? ' sel' : '';
      html += '<div class="file' + cls + '" onclick="selectChangeFile(\\'' + escAttr(f.path) + '\\')">';
      html += '<span class="badge ' + s + '">' + f.status + '</span>';
      html += '<span class="fpath" title="' + esc(f.path) + '">' + esc(name) + '</span>';
      if (f.oldPath) html += '<span class="old-path" title="' + esc(f.oldPath) + '">&larr; ' + esc(f.oldPath.split('/').pop()) + '</span>';
      html += '</div>';
    }
  }
  sb.innerHTML = html;
}

function selectChangeFile(path) {
  selectedFile = path;
  selectedBrowseFile = null;
  document.querySelectorAll('#sidebar .file').forEach(el => {
    const elPath = el.querySelector('.fpath')?.getAttribute('title');
    el.classList.toggle('sel', elPath === path);
  });
  loadDiff(path);
}

// === FILES / EXPLORER PANEL ===
async function loadExplorer() {
  try {
    const r = await fetch('/api/files');
    const data = await r.json();
    explorerData = data.tree;
    renderExplorerTree(data.tree);
  } catch(e) { console.error('explorer fetch failed', e); }
}

function renderExplorerTree(nodes) {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = renderTreeNodes(nodes, 0);
}

function renderTreeNodes(nodes, depth) {
  let html = '';
  for (const node of nodes) {
    const pad = 8 + depth * 16;
    if (node.type === 'dir') {
      const expanded = expandedDirs[node.path] !== false; // default expanded for depth 0
      const arrow = expanded ? '&#9660;' : '&#9654;';
      html += '<div class="tree-item" style="padding-left:' + pad + 'px" onclick="toggleDir(\\'' + escAttr(node.path) + '\\')">';
      html += '<span class="tree-icon dir">' + arrow + '</span>';
      html += '<span class="tree-name">' + esc(node.name) + '</span>';
      html += '</div>';
      if (expanded && node.children) {
        html += '<div class="tree-children" id="dir-' + esc(node.path).replace(/[^a-zA-Z0-9]/g, '-') + '">';
        html += renderTreeNodes(node.children, depth + 1);
        html += '</div>';
      }
    } else {
      const cls = selectedBrowseFile === node.path ? ' sel' : '';
      html += '<div class="tree-item' + cls + '" style="padding-left:' + (pad + 16) + 'px" onclick="selectBrowseFile(\\'' + escAttr(node.path) + '\\')">';
      html += '<span class="tree-name">' + esc(node.name) + '</span>';
      html += '</div>';
    }
  }
  return html;
}

function toggleDir(path) {
  expandedDirs[path] = expandedDirs[path] === false ? true : (expandedDirs[path] === undefined ? false : !expandedDirs[path]);
  renderExplorerTree(explorerData);
}

function selectBrowseFile(path) {
  selectedBrowseFile = path;
  selectedFile = null;
  document.querySelectorAll('#sidebar .tree-item').forEach(el => {
    el.classList.remove('sel');
  });
  // Re-render to update selection
  renderExplorerTree(explorerData);
  loadFileContent(path);
}

async function loadFileContent(path) {
  try {
    const r = await fetch('/api/file?path=' + encodeURIComponent(path));
    const data = await r.json();
    renderFileContent(data);
  } catch(e) { console.error('file fetch failed', e); }
}

function renderFileContent(data) {
  const panel = document.getElementById('diff-panel');
  let html = '<div class="diff-hdr"><span class="diff-path">' + esc(data.path) + '</span>';
  if (!data.binary) html += '<span class="diff-stats">' + data.lines + ' lines</span>';
  html += '</div>';

  if (data.binary) {
    html += '<div class="special">Binary file</div>';
    panel.innerHTML = html;
    return;
  }

  const lines = data.content.split('\\n');
  for (let i = 0; i < lines.length; i++) {
    html += '<div class="fv-line"><span class="ln">' + (i + 1) + '</span><span class="dc">' + esc(lines[i]) + '</span></div>';
  }

  if (data.truncated) {
    html += '<div class="truncated">File truncated at 10,000 lines</div>';
  }

  panel.innerHTML = html;
}

// === DIFF RENDERING ===
async function loadDiff(path) {
  try {
    const r = await fetch('/api/diff?file=' + encodeURIComponent(path) + '&mode=' + currentMode);
    const diff = await r.json();
    renderDiff(diff);
  } catch(e) { console.error('diff fetch failed', e); }
}

function renderDiff(diff) {
  const panel = document.getElementById('diff-panel');
  let html = '';
  html += '<div class="diff-hdr"><span class="diff-path">' + esc(diff.path);
  if (diff.oldPath) html += ' <span style="color:var(--text-3)">&larr; ' + esc(diff.oldPath) + '</span>';
  html += '</span><span class="diff-stats">';
  let adds = 0, dels = 0;
  for (const h of diff.hunks) for (const l of h.lines) { if (l.type==='add') adds++; if (l.type==='del') dels++; }
  if (adds) html += '<span class="a">+' + adds + '</span> ';
  if (dels) html += '<span class="d">-' + dels + '</span>';
  html += '</span></div>';

  if (diff.modeChange) {
    html += '<div class="special">Mode changed: ' + esc(diff.modeChange.old) + ' &rarr; ' + esc(diff.modeChange.new) + '</div>';
  }
  if (diff.submodule) {
    html += '<div class="special">Submodule updated: ' + esc(diff.submodule) + '</div>';
  }
  if (diff.binary) { html += '<div class="special">Binary file</div>'; panel.innerHTML = html; return; }
  if (diff.hunks.length === 0 && !diff.modeChange && !diff.submodule) {
    html += '<div class="special">(empty file)</div>'; panel.innerHTML = html; return;
  }

  if (currentView === 'split') { html += renderSplitDiff(diff); }
  else { html += renderUnifiedDiff(diff); }

  if (diff.truncated) { html += '<div class="truncated">Diff truncated at 5,000 lines</div>'; }
  panel.innerHTML = html;
}

function renderUnifiedDiff(diff) {
  let html = '';
  for (const hunk of diff.hunks) {
    html += '<div class="hunk-hdr">' + esc(hunk.header) + '</div>';
    for (const line of hunk.lines) {
      if (line.type === 'no-newline') { html += '<div class="dl nnl">\\\\ No newline at end of file</div>'; continue; }
      const cls = line.type;
      const num = line.type === 'add' ? (line.newNum || '') : line.type === 'del' ? (line.oldNum || '') : (line.newNum || '');
      html += '<div class="dl ' + cls + '"><span class="ln">' + num + '</span><span class="dc">' + esc(line.content) + '</span></div>';
    }
  }
  return html;
}

function renderSplitDiff(diff) {
  let html = '<div class="sbs"><div class="side"><div class="side-hdr">Before</div>';
  let htmlR = '<div class="side"><div class="side-hdr">After</div>';
  for (const hunk of diff.hunks) {
    html += '<div class="hunk-hdr">' + esc(hunk.header) + '</div>';
    htmlR += '<div class="hunk-hdr">' + esc(hunk.header) + '</div>';
    let i = 0;
    const lines = hunk.lines;
    while (i < lines.length) {
      if (lines[i].type === 'no-newline') { i++; continue; }
      if (lines[i].type === 'ctx') {
        const l = lines[i];
        html += '<div class="dl ctx"><span class="ln">' + (l.oldNum||'') + '</span><span class="dc">' + esc(l.content) + '</span></div>';
        htmlR += '<div class="dl ctx"><span class="ln">' + (l.newNum||'') + '</span><span class="dc">' + esc(l.content) + '</span></div>';
        i++;
      } else {
        const delLines = [], addLines = [];
        while (i < lines.length && lines[i].type === 'del') { delLines.push(lines[i]); i++; }
        while (i < lines.length && lines[i].type === 'add') { addLines.push(lines[i]); i++; }
        const max = Math.max(delLines.length, addLines.length);
        for (let j = 0; j < max; j++) {
          if (j < delLines.length) { html += '<div class="dl del"><span class="ln">' + (delLines[j].oldNum||'') + '</span><span class="dc">' + esc(delLines[j].content) + '</span></div>'; }
          else { html += '<div class="dl pad"></div>'; }
          if (j < addLines.length) { htmlR += '<div class="dl add"><span class="ln">' + (addLines[j].newNum||'') + '</span><span class="dc">' + esc(addLines[j].content) + '</span></div>'; }
          else { htmlR += '<div class="dl pad"></div>'; }
        }
      }
    }
  }
  html += '</div>' + htmlR + '</div></div>';
  return html;
}

// SSE
let evtSource = null;
function connectSSE() {
  if (IS_BRANCH) return;
  const dot = document.getElementById('live-dot');
  evtSource = new EventSource('/events');
  evtSource.onopen = () => { dot.textContent = '\\u25CF'; };
  evtSource.onmessage = (e) => {
    if (e.data === 'refresh') {
      refreshTree();
      if (sidebarPanel === 'files') { explorerData = null; loadExplorer(); }
    }
  };
  evtSource.onerror = () => {
    dot.textContent = '\\u25CB';
    evtSource.close();
    setTimeout(connectSSE, 2000);
  };
}

// Init
refreshTree();
connectSSE();
</script>
</body>
</html>`;
}
