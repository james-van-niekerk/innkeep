import type { BrewPackage } from "./brew";

export interface Ledger {
	formulae: BrewPackage[];
	casks: BrewPackage[];
	savedAt: string;
}
