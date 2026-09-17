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

export async function install(name: string): Promise<void> {
	await $`brew install ${name}`;
}

export async function uninstall(name: string): Promise<void> {
	await $`brew uninstall ${name}`;
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
