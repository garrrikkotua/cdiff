let _repoRoot: string | null = null;
let _prefix: string = "";

export async function initGit(): Promise<void> {
  const rootProc = Bun.spawn(["git", "rev-parse", "--show-toplevel"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const root = (await new Response(rootProc.stdout).text()).trim();
  await rootProc.exited;
  if (rootProc.exitCode !== 0) throw new Error("Not a git repository");
  _repoRoot = root;

  // Compute the prefix: cwd relative to repo root
  const cwd = process.cwd();
  if (cwd !== root && cwd.startsWith(root + "/")) {
    _prefix = cwd.slice(root.length + 1) + "/";
  }
}

function repoRoot(): string {
  if (!_repoRoot) throw new Error("initGit() not called");
  return _repoRoot;
}

function spawnGit(args: string[]): ReturnType<typeof Bun.spawn> {
  return Bun.spawn(args, {
    stdout: "pipe",
    stderr: "pipe",
    cwd: repoRoot(),
  });
}

// Strip repo-root prefix from paths so they appear relative to cwd
function stripPrefix(p: string): string {
  if (_prefix && p.startsWith(_prefix)) {
    return p.slice(_prefix.length);
  }
  return p;
}

// Add prefix back for git commands
function addPrefix(p: string): string {
  if (_prefix) return _prefix + p;
  return p;
}

export interface FileEntry {
  status: "M" | "A" | "D" | "R" | "C" | "T";
  path: string;
  oldPath?: string;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffLine {
  type: "add" | "del" | "ctx" | "no-newline";
  content: string;
  oldNum?: number;
  newNum?: number;
}

export interface FileDiff {
  path: string;
  oldPath?: string;
  status: string;
  binary: boolean;
  hunks: DiffHunk[];
  truncated: boolean;
  submodule?: string;
  modeChange?: { old: string; new: string };
}

export type DiffMode = "all" | "staged" | "unstaged";

export interface DiffOptions {
  mode: DiffMode;
  range?: string; // e.g. "main..HEAD"
}

function unquoteGitPath(p: string): string {
  if (p.startsWith('"') && p.endsWith('"')) {
    return p
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, '"');
  }
  return p;
}

function gitDiffArgs(opts: DiffOptions): string[] {
  if (opts.range) {
    return ["git", "diff", opts.range, "-M", "--no-color"];
  }
  switch (opts.mode) {
    case "staged":
      return ["git", "diff", "--cached", "-M", "--no-color"];
    case "unstaged":
      return ["git", "diff", "-M", "--no-color"];
    case "all":
    default:
      return ["git", "diff", "HEAD", "-M", "--no-color"];
  }
}

function gitNameStatusArgs(opts: DiffOptions): string[] {
  if (opts.range) {
    return ["git", "diff", opts.range, "--name-status", "-M"];
  }
  switch (opts.mode) {
    case "staged":
      return ["git", "diff", "--cached", "--name-status", "-M"];
    case "unstaged":
      return ["git", "diff", "--name-status", "-M"];
    case "all":
    default:
      return ["git", "diff", "HEAD", "--name-status", "-M"];
  }
}

export async function getFileTree(opts: DiffOptions): Promise<FileEntry[]> {
  // If we're in a subdirectory, scope the diff to that subdirectory
  const args = _prefix
    ? [...gitNameStatusArgs(opts), "--", _prefix]
    : gitNameStatusArgs(opts);
  const proc = spawnGit(args);
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  const entries: FileEntry[] = [];
  for (const line of stdout.trim().split("\n")) {
    if (!line) continue;
    const parts = line.split("\t");
    const statusCode = parts[0];

    if (statusCode.startsWith("R") || statusCode.startsWith("C")) {
      entries.push({
        status: statusCode[0] as "R" | "C",
        oldPath: stripPrefix(unquoteGitPath(parts[1])),
        path: stripPrefix(unquoteGitPath(parts[2])),
      });
    } else {
      entries.push({
        status: statusCode[0] as "M" | "A" | "D" | "T",
        path: stripPrefix(unquoteGitPath(parts[1])),
      });
    }
  }
  return entries;
}

const MAX_DIFF_LINES = 5000;

export async function getFileDiff(
  filePath: string,
  opts: DiffOptions
): Promise<FileDiff> {
  const gitPath = addPrefix(filePath);
  const args = [...gitDiffArgs(opts), "--", gitPath];
  const proc = spawnGit(args);
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  return parseDiffOutput(stdout, filePath);
}

export function parseDiffOutput(raw: string, filePath: string): FileDiff {
  const result: FileDiff = {
    path: filePath,
    status: "M",
    binary: false,
    hunks: [],
    truncated: false,
  };

  if (!raw.trim()) {
    return result;
  }

  const lines = raw.split("\n");
  let i = 0;

  // Parse headers
  while (i < lines.length && !lines[i].startsWith("@@") && !lines[i].startsWith("Binary")) {
    const line = lines[i];
    if (line.startsWith("rename from ")) {
      result.oldPath = line.slice("rename from ".length);
      result.status = "R";
    } else if (line.startsWith("rename to ")) {
      result.path = line.slice("rename to ".length);
    } else if (line.startsWith("old mode ")) {
      result.modeChange = result.modeChange || { old: "", new: "" };
      result.modeChange.old = line.slice("old mode ".length);
    } else if (line.startsWith("new mode ")) {
      result.modeChange = result.modeChange || { old: "", new: "" };
      result.modeChange.new = line.slice("new mode ".length);
    } else if (line.startsWith("Subproject commit ")) {
      result.submodule = line.slice("Subproject commit ".length);
    }
    i++;
  }

  // Binary file
  if (i < lines.length && lines[i].startsWith("Binary")) {
    result.binary = true;
    return result;
  }

  // Parse hunks
  let totalLines = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith("@@")) {
      i++;
      continue;
    }

    const hunkMatch = line.match(
      /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/
    );
    if (!hunkMatch) {
      i++;
      continue;
    }

    let oldNum = parseInt(hunkMatch[1], 10);
    let newNum = parseInt(hunkMatch[2], 10);
    const hunk: DiffHunk = {
      header: line,
      lines: [],
    };

    i++;
    while (i < lines.length && !lines[i].startsWith("@@") && !lines[i].startsWith("diff --git")) {
      if (totalLines >= MAX_DIFF_LINES) {
        result.truncated = true;
        break;
      }

      const dl = lines[i];
      if (dl.startsWith("+")) {
        hunk.lines.push({
          type: "add",
          content: dl.slice(1),
          newNum: newNum++,
        });
        totalLines++;
      } else if (dl.startsWith("-")) {
        hunk.lines.push({
          type: "del",
          content: dl.slice(1),
          oldNum: oldNum++,
        });
        totalLines++;
      } else if (dl === "\\ No newline at end of file") {
        hunk.lines.push({ type: "no-newline", content: dl });
      } else {
        hunk.lines.push({
          type: "ctx",
          content: dl.startsWith(" ") ? dl.slice(1) : dl,
          oldNum: oldNum++,
          newNum: newNum++,
        });
        totalLines++;
      }
      i++;
    }

    if (hunk.lines.length > 0) {
      result.hunks.push(hunk);
    }
    if (result.truncated) break;
  }

  return result;
}

export async function isGitRepo(): Promise<boolean> {
  const proc = Bun.spawn(["git", "rev-parse", "--git-dir"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
  return proc.exitCode === 0;
}

export async function isMergeInProgress(): Promise<boolean> {
  const gitDir = await getGitDir();
  if (!gitDir) return false;
  return Bun.file(`${gitDir}/MERGE_HEAD`).exists();
}

export async function getGitDir(): Promise<string | null> {
  const proc = spawnGit(["git", "rev-parse", "--absolute-git-dir"]);
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;
  if (proc.exitCode !== 0) return null;
  return stdout.trim();
}

export async function getDiffStats(
  opts: DiffOptions
): Promise<{ additions: number; deletions: number }> {
  const args = opts.range
    ? ["git", "diff", opts.range, "--shortstat"]
    : opts.mode === "staged"
      ? ["git", "diff", "--cached", "--shortstat"]
      : opts.mode === "unstaged"
        ? ["git", "diff", "--shortstat"]
        : ["git", "diff", "HEAD", "--shortstat"];

  // Scope shortstat to our prefix too
  if (_prefix) args.push("--", _prefix);
  const proc = spawnGit(args);
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  const addMatch = stdout.match(/(\d+) insertion/);
  const delMatch = stdout.match(/(\d+) deletion/);
  return {
    additions: addMatch ? parseInt(addMatch[1], 10) : 0,
    deletions: delMatch ? parseInt(delMatch[1], 10) : 0,
  };
}
