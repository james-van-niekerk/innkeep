import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { defaultTheme, type Theme } from "../ui/theme";
import defaultConfigTemplate from "../assets/config.example.yaml" with { type: "text" };

export interface Config {
	ledgersPath: string;
	theme: Theme;
}

// XDG Base Directory spec: honour $XDG_CONFIG_HOME, fall back to ~/.config.
export const configDir = join(
	process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
	"innkeep",
);
export const configPath = join(configDir, "config.yaml");

const defaultLedgersPath = join(configDir, "ledgers");

// The ledgers path depends on $XDG_CONFIG_HOME, so it's filled in at runtime.
function defaultConfigYaml(): string {
	return defaultConfigTemplate.replace(
		"{{ledgersPath}}",
		defaultLedgersPath.replace(homedir(), "~"),
	);
}

function expandHome(path: string): string {
	if (path === "~") return homedir();
	if (path.startsWith("~/")) return join(homedir(), path.slice(2));
	return path;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Merge the user's file over the defaults, ignoring anything malformed.
function parseConfig(raw: unknown): Config {
	const user = isRecord(raw) ? raw : {};
	const userTheme = isRecord(user.theme) ? user.theme : {};

	const theme = { ...defaultTheme };
	for (const key of Object.keys(defaultTheme) as (keyof Theme)[]) {
		const value = userTheme[key];
		if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
			theme[key] = value;
		}
	}

	const ledgersPath =
		typeof user.ledgersPath === "string" && user.ledgersPath.trim()
			? expandHome(user.ledgersPath.trim())
			: defaultLedgersPath;

	return { ledgersPath, theme };
}

async function readOrCreateConfig(): Promise<Config> {
	const file = Bun.file(configPath);
	if (!(await file.exists())) {
		await mkdir(configDir, { recursive: true });
		await Bun.write(configPath, defaultConfigYaml());
	}

	const config = parseConfig(Bun.YAML.parse(await file.text()));
	await mkdir(config.ledgersPath, { recursive: true });
	return config;
}

let cached: Promise<Config> | undefined;

// Loaded once per run; later calls share the same result.
export function loadConfig(): Promise<Config> {
	cached ??= readOrCreateConfig();
	return cached;
}
