import { $ } from "bun";
import type { BrewPackage } from "../types/brew";

export async function listInstalledFormulae(): Promise<BrewPackage[]> {
  const out = await $`brew list --formula --versions`.text();
  return parseNameVersionLines(out);
}

export async function listInstalledCasks(): Promise<BrewPackage[]> {
  const out = await $`brew list --cask --versions`.text();
  return parseNameVersionLines(out);
}

export async function listDependancies(): Promise<BrewPackage[]> {
  const out = await $`brew list --no-installed-on-request --versions`.text();
  return parseNameVersionLines(out);
}

export async function listLeaves(): Promise<string[]> {
  const out = await $`brew leaves`.text();
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function search(query: string): Promise<string[]> {
  const out = await $`brew search ${query}`.text();
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("==>"));
}

export async function info(name: string): Promise<unknown> {
  const out = await $`brew info --json=v2 ${name}`.text();
  return JSON.parse(out);
}

export function install(name: string): AsyncIterable<string> {
  return streamCommand(["brew", "install", name]);
}

export function uninstall(name: string): AsyncIterable<string> {
  return streamCommand(["brew", "uninstall", name]);
}

// Bun's `$\`...\`.lines()` buffers until exit and ignores stderr, so spawn
// directly and yield stdout + stderr lines as they arrive.
async function* streamCommand(cmd: string[]): AsyncGenerator<string> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOMEBREW_NO_COLOR: "1", HOMEBREW_NO_EMOJI: "1" },
  });

  const queue: string[] = [];
  let wake: (() => void) | null = null;
  const notify = () => {
    wake?.();
    wake = null;
  };

  const pump = async (stream: ReadableStream<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";
    for await (const chunk of stream) {
      buffer += decoder.decode(chunk, { stream: true });
      const parts = buffer.split(/\r?\n|\r/);
      buffer = parts.pop() ?? "";
      queue.push(...parts);
      notify();
    }
    buffer += decoder.decode();
    if (buffer) queue.push(buffer);
    notify();
  };

  let done = false;
  const pumps = Promise.all([pump(proc.stdout), pump(proc.stderr)]).finally(
    () => {
      done = true;
      notify();
    },
  );

  while (true) {
    if (queue.length > 0) {
      yield queue.shift() as string;
      continue;
    }
    if (done) break;
    await new Promise<void>((resolve) => {
      wake = resolve;
    });
  }

  await pumps;
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`${cmd.join(" ")} exited with code ${exitCode}`);
  }
}

function parseNameVersionLines(out: string): BrewPackage[] {
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(" ");
      const name = parts[0] ?? line;
      const version = parts.slice(1).join(" ") || undefined;
      return { name, version };
    });
}
