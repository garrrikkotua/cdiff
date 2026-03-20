import { getFileTree, getFileDiff, getDiffStats, isMergeInProgress, type DiffMode, type DiffOptions } from "./git";
import { renderHTML } from "./html";
import { startWatcher } from "./watcher";

const sseClients = new Set<ReadableStreamDefaultController>();

function notifyClients() {
  for (const controller of sseClients) {
    try {
      controller.enqueue("data: refresh\n\n");
    } catch {
      sseClients.delete(controller);
    }
  }
}

function buildDiffOpts(url: URL, range?: string): DiffOptions {
  if (range) return { mode: "all", range };
  const mode = (url.searchParams.get("mode") || "all") as DiffMode;
  return { mode };
}

export async function startServer(opts: {
  port: number;
  range?: string;
  cwd: string;
}): Promise<{ port: number; stop: () => void }> {
  const isMerge = await isMergeInProgress();
  const isBranchCompare = !!opts.range;

  const html = renderHTML({
    isBranchCompare,
    isMerge,
    range: opts.range,
  });

  let actualPort = opts.port;
  let server: ReturnType<typeof Bun.serve> | null = null;

  // Try up to 10 ports
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      server = Bun.serve({
        port: actualPort,
        hostname: "127.0.0.1",
        fetch(req) {
          const url = new URL(req.url);

          if (url.pathname === "/") {
            return new Response(html, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }

          if (url.pathname === "/api/tree") {
            const diffOpts = buildDiffOpts(url, opts.range);
            return handleTree(diffOpts);
          }

          if (url.pathname === "/api/diff") {
            const file = url.searchParams.get("file");
            if (!file) {
              return Response.json({ error: "file parameter required" }, { status: 400 });
            }
            const diffOpts = buildDiffOpts(url, opts.range);
            return handleDiff(file, diffOpts);
          }

          if (url.pathname === "/events") {
            return handleSSE();
          }

          return new Response("Not found", { status: 404 });
        },
      });
      break;
    } catch (err: any) {
      if (err.code === "EADDRINUSE" || err.message?.includes("address already in use")) {
        actualPort++;
        continue;
      }
      throw err;
    }
  }

  if (!server) {
    throw new Error(`Could not find an available port (tried ${opts.port}-${actualPort})`);
  }

  // Start file watcher (only for working directory mode)
  let watcher: { stop: () => void } | null = null;
  if (!isBranchCompare) {
    watcher = await startWatcher(opts.cwd, notifyClients);
  }

  return {
    port: actualPort,
    stop: () => {
      watcher?.stop();
      server?.stop();
      for (const c of sseClients) {
        try { c.close(); } catch {}
      }
      sseClients.clear();
    },
  };
}

async function handleTree(opts: DiffOptions): Promise<Response> {
  const [files, stats] = await Promise.all([
    getFileTree(opts),
    getDiffStats(opts),
  ]);
  return Response.json({ files, stats });
}

async function handleDiff(file: string, opts: DiffOptions): Promise<Response> {
  const diff = await getFileDiff(file, opts);
  return Response.json(diff);
}

function handleSSE(): Response {
  const stream = new ReadableStream({
    start(controller) {
      sseClients.add(controller);
      controller.enqueue("data: connected\n\n");
    },
    cancel(controller) {
      sseClients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
