import { watch, type FSWatcher } from "fs";
import { resolve } from "path";
import { getGitDir } from "./git";

type ChangeCallback = () => void;

const DEBOUNCE_MS = 300;
const IGNORE_PATTERNS = [
  /\.git\/objects/,
  /\.git\/logs/,
  /\.swp$/,
  /~$/,
  /\.DS_Store$/,
  /4913$/, // vim temp
];

export async function startWatcher(
  cwd: string,
  onChange: ChangeCallback
): Promise<{ stop: () => void }> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const watchers: FSWatcher[] = [];

  const debouncedChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, DEBOUNCE_MS);
  };

  const shouldIgnore = (filename: string | null): boolean => {
    if (!filename) return false;
    return IGNORE_PATTERNS.some((p) => p.test(filename));
  };

  const gitDirRaw = await getGitDir();
  // getGitDir may return relative path — resolve it
  const gitDir = gitDirRaw ? resolve(gitDirRaw) : null;

  try {
    // Watch .git/index for staging changes
    if (gitDir) {
      const indexWatcher = watch(
        `${gitDir}/index`,
        { persistent: false },
        (event, filename) => {
          if (!shouldIgnore(filename)) debouncedChange();
        }
      );
      watchers.push(indexWatcher);

      // Watch .git/HEAD for branch switches
      try {
        const headWatcher = watch(
          `${gitDir}/HEAD`,
          { persistent: false },
          () => debouncedChange()
        );
        watchers.push(headWatcher);
      } catch {}

      // Watch .git/MERGE_HEAD for merge state changes
      try {
        const mergeWatcher = watch(
          `${gitDir}/MERGE_HEAD`,
          { persistent: false },
          () => debouncedChange()
        );
        watchers.push(mergeWatcher);
      } catch {}
    }

    // Watch working directory (recursive)
    const cwdWatcher = watch(
      cwd,
      { recursive: true, persistent: false },
      (event, filename) => {
        if (!filename) return;
        if (filename.startsWith(".git/") || filename.startsWith(".git\\"))
          return;
        if (!shouldIgnore(filename)) debouncedChange();
      }
    );
    watchers.push(cwdWatcher);
  } catch (err: any) {
    // If native watching fails, we just won't have live reload
    console.error(`[cdiff] File watching unavailable: ${err.message}`);
  }

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      for (const w of watchers) {
        try {
          w.close();
        } catch {}
      }
    },
  };
}
