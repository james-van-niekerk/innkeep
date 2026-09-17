import type { CliRenderer } from "@opentui/core";
import {
	BoxRenderable,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";
import type { BrewPackage } from "../../types/brew";

export class PackageList {
	readonly panel: BoxRenderable;
	private readonly select: SelectRenderable;

	constructor(renderer: CliRenderer, onSelect: (pkg: BrewPackage) => void) {
		this.panel = new BoxRenderable(renderer, {
			borderStyle: "single",
			borderColor: "#666666",
			width: 60,
			height: 20,
		});

		this.select = new SelectRenderable(renderer, {
			id: "packages",
			width: "100%",
			height: "100%",
			options: [],
			showDescription: false,
		});

		this.panel.add(this.select);

		this.select.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
			onSelect({ name: option.name, version: option.description });
		});
	}

	focus(): void {
		this.select.focus();
	}

	setPackages(packages: BrewPackage[]): void {
		this.select.options = packages.map((pkg) => ({
			name: pkg.name,
			description: pkg.version ?? "",
		}));
	}
}
