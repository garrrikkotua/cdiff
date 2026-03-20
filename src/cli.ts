#!/usr/bin/env bun
import { isGitRepo, initGit } from "./git";
import { startServer } from "./server";

const DEFAULT_PORT = 3847;

function parseArgs(args: string[]): {
  port: number;
  range?: string;
  help: boolean;
} {
  let port = DEFAULT_PORT;
  let range: string | undefined;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--port" || arg === "-p") {
      port = parseInt(args[++i], 10);
      if (isNaN(port)) {
        console.error("Invalid port number");
        process.exit(1);
      }
    } else if (arg.includes("..")) {
      range = arg;
    } else if (!arg.startsWith("-")) {
      range = arg;
    }
  }

  return { port, range, help };
}

function printHelp() {
  console.log(`cdiff — Browser-based git diff viewer

Usage:
  cdiff                     View working directory changes
  cdiff --staged            View staged changes only (not implemented as CLI flag yet)
  cdiff main..HEAD          Compare branches
  cdiff <commit>..<commit>  Compare commits

Options:
  -p, --port <port>    Port to use (default: ${DEFAULT_PORT})
  -h, --help           Show this help

The browser opens automatically. Changes are live-reloaded.
Press Ctrl+C to stop.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!(await isGitRepo())) {
    console.error("cdiff: not a git repository");
    process.exit(1);
  }

  await initGit();
  const cwd = process.cwd();

  try {
    const { port } = await startServer({
      port: args.port,
      range: args.range,
      cwd,
    });

    const url = `http://127.0.0.1:${port}`;
    console.log(`cdiff running at ${url}`);

    // Open browser
    const opener =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "start"
          : "xdg-open";
    Bun.spawn([opener, url], { stdout: "ignore", stderr: "ignore" });

    // Keep alive, handle SIGINT
    process.on("SIGINT", () => {
      console.log("\ncdiff stopped.");
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      process.exit(0);
    });
  } catch (err: any) {
    console.error(`cdiff: ${err.message}`);
    process.exit(1);
  }
}

main();
