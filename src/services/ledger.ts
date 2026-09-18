import type { Ledger } from "../types/ledger";
import { listInstalledCasks, listInstalledFormulae } from "./brew";

export async function captureLedger(): Promise<Ledger> {
	const [formulae, casks] = await Promise.all([
		listInstalledFormulae(),
		listInstalledCasks(),
	]);
	return { formulae, casks, savedAt: new Date().toISOString() };
}

export async function saveLedger(
	path: string,
	ledger: Ledger,
): Promise<void> {
	await Bun.write(path, JSON.stringify(ledger, null, 2));
}

export async function loadLedger(path: string): Promise<Ledger> {
	return Bun.file(path).json();
}
