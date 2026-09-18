import type { Profile } from "../types/profile";
import { listInstalledCasks, listInstalledFormulae } from "./brew";

export async function captureProfile(): Promise<Profile> {
	const [formulae, casks] = await Promise.all([
		listInstalledFormulae(),
		listInstalledCasks(),
	]);
	return { formulae, casks, savedAt: new Date().toISOString() };
}

export async function saveProfile(
	path: string,
	profile: Profile,
): Promise<void> {
	await Bun.write(path, JSON.stringify(profile, null, 2));
}

export async function loadProfile(path: string): Promise<Profile> {
	return Bun.file(path).json();
}
