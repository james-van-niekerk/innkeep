import type { CliRenderer } from "@opentui/core";
import { SelectRenderable, SelectRenderableEvents } from "@opentui/core";
import type { BrewPackage } from "../../types/brew";
import { theme } from "../theme";

export class PackageList {
	readonly renderable: SelectRenderable;

	constructor(
		renderer: CliRenderer,
		id: string,
		handlers: {
			onHighlight?: (pkg: BrewPackage) => void;
			onSelect?: (pkg: BrewPackage) => void;
		} = {},
	) {
		this.renderable = new SelectRenderable(renderer, {
			id,
			width: "100%",
			height: "100%",
			options: [],
			showDescription: true,
			backgroundColor: theme.panelBg,
			textColor: theme.text,
			selectedTextColor: theme.accent,
			descriptionColor: theme.textDim,
		});

		this.renderable.on(
			SelectRenderableEvents.SELECTION_CHANGED,
			(_i, option) => {
				if (option) handlers.onHighlight?.(toPackage(option));
			},
		);
		this.renderable.on(SelectRenderableEvents.ITEM_SELECTED, (_i, option) => {
			if (option) handlers.onSelect?.(toPackage(option));
		});
	}

	focus(): void {
		this.renderable.focus();
	}

	blur(): void {
		this.renderable.blur();
	}

	setPackages(packages: BrewPackage[]): void {
		this.renderable.options = packages.map((pkg) => ({
			name: pkg.name,
			description: pkg.version ?? "",
		}));
	}
}

function toPackage(option: {
	name: string;
	description?: string;
}): BrewPackage {
	return { name: option.name, version: option.description || undefined };
}
