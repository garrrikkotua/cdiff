import { readdir, stat } from "fs/promises";
import { join, relative } from "path";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
}

const IGNORE = new Set([
  ".git",
  "node_modules",
  ".next",
  ".nuxt",
  ".turbo",
  "dist",
  "build",
  ".cache",
  ".DS_Store",
  "__pycache__",
  ".pytest_cache",
  "coverage",
  ".nyc_output",
  "vendor",
  ".svelte-kit",
]);

const MAX_FILES = 5000;
let fileCount = 0;

export async function getDirectoryTree(rootDir: string): Promise<FileNode[]> {
  fileCount = 0;
  return walk(rootDir, rootDir);
}

async function walk(dir: string, rootDir: string): Promise<FileNode[]> {
  if (fileCount >= MAX_FILES) return [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  // Sort: directories first, then files, both alphabetical
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const nodes: FileNode[] = [];
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".env.example") continue;
    if (fileCount >= MAX_FILES) break;

    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      const children = await walk(fullPath, rootDir);
      if (children.length > 0) {
        nodes.push({ name: entry.name, path: relPath, type: "dir", children });
      }
    } else {
      fileCount++;
      nodes.push({ name: entry.name, path: relPath, type: "file" });
    }
  }

  return nodes;
}

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".avif",
  ".mp3", ".mp4", ".wav", ".ogg", ".webm", ".mov", ".avi",
  ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".exe", ".dll", ".so", ".dylib",
  ".sqlite", ".db",
]);

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_LINES = 10000;

export async function readFileContent(
  filePath: string
): Promise<{ content: string; binary: boolean; truncated: boolean; lines: number }> {
  const ext = filePath.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
  if (BINARY_EXTENSIONS.has(ext)) {
    return { content: "", binary: true, truncated: false, lines: 0 };
  }

  try {
    const file = Bun.file(filePath);
    const size = file.size;

    if (size > MAX_FILE_SIZE) {
      return { content: "", binary: true, truncated: false, lines: 0 };
    }

    const text = await file.text();

    // Check if binary (contains null bytes)
    if (text.includes("\0")) {
      return { content: "", binary: true, truncated: false, lines: 0 };
    }

    const allLines = text.split("\n");
    const truncated = allLines.length > MAX_LINES;
    const lines = truncated ? allLines.slice(0, MAX_LINES) : allLines;

    return {
      content: lines.join("\n"),
      binary: false,
      truncated,
      lines: allLines.length,
    };
  } catch {
    return { content: "", binary: true, truncated: false, lines: 0 };
  }
}
