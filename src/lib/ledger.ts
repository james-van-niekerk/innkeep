import { readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { LedgerFile } from "../types/ledger";
import { loadConfig } from "./config.ts";

export async function listLedgers(): Promise<LedgerFile[]> {
  try {
    const config = await loadConfig();
    const ledgersDirectory = await readdir(config.ledgersPath);
    const ledgerFiles = <LedgerFile[]>[];

    for (const ledger of ledgersDirectory) {
      if (extname(ledger) === ".yaml") {
        ledgerFiles.push({
          path: join(config.ledgersPath, ledger),
          name: basename(ledger, ".yaml"),
        });
      }
    }

    return ledgerFiles;
  } catch (err: unknown) {
    console.error(err);
    return [];
  }
}

export async function readLedger(path: string): Promise<string> {
  try {
    return await Bun.file(path).text();
  } catch (err: unknown) {
    console.error(err);
    return "";
  }
}

export async function writeLedger(path: string, yaml: string): Promise<void> {
  try {
    await Bun.write(path, yaml);
  } catch (err: unknown) {
    console.error(err);
  }
}

export async function openLedgerInEditor(path: string): Promise<void> {}
