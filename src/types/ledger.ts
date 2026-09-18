import type { BrewPackage } from "./brew";

export interface Profile {
	formulae: BrewPackage[];
	casks: BrewPackage[];
	savedAt: string;
}
