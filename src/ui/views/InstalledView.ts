import type { CliRenderer } from "@opentui/core";
import {
	BoxRenderable,
	SelectRenderable,
	SelectRenderableEvents,
	TextRenderable,
} from "@opentui/core";
import { listInstalledCasks, listInstalledFormulae } from "../../services/brew";
import type { BrewPackage } from "../../types/brew";
import { PackageList } from "../components/PackageList";
import { theme } from "../theme";
import type { View } from "./View";

type Source = "formulae" | "casks";

export class InstalledView implements View {
	readonly id = "installed";
	readonly sidebarTitle = "Sources";
	readonly mainTitle = "Installed";
	readonly hints = "tab pane · ↑↓ move · r reload · q quit";

	readonly sidebar: SelectRenderable;
	readonly main: BoxRenderable;

	private readonly list: PackageList;
	private readonly detail: TextRenderable;
	private source: Source = "formulae";
	private loaded = false;

	constructor(
		renderer: CliRenderer,
		private readonly setStatus: (text: string) => void,
	) {
		this.sidebar = new SelectRenderable(renderer, {
			id: "installed-sources",
			width: "100%",
			height: "100%",
			backgroundColor: theme.panelBg,
			textColor: theme.text,
			selectedTextColor: theme.accent,
			showDescription: false,
			options: [
				{ name: "Formulae", description: "", value: "formulae" },
				{ name: "Casks", description: "", value: "casks" },
			],
		});
		this.sidebar.on(SelectRenderableEvents.ITEM_SELECTED, (index) => {
			this.source = index === 1 ? "casks" : "formulae";
			void this.load();
		});

		this.main = new BoxRenderable(renderer, {
			id: "installed-main",
			width: "100%",
			height: "100%",
			flexDirection: "column",
		});

		const listBox = new BoxRenderable(renderer, {
			id: "installed-list",
			width: "100%",
			flexGrow: 1,
			minHeight: 0,
			overflow: "hidden",
		});

		this.list = new PackageList(renderer, "installed-packages", {
			onHighlight: (pkg) => this.showDetail(pkg),
		});
		listBox.add(this.list.renderable);

		const detailBox = new BoxRenderable(renderer, {
			id: "installed-detail",
			width: "100%",
			height: 4,
			flexShrink: 0,
			paddingLeft: 1,
			borderStyle: "single",
			border: ["top"],
			borderColor: theme.border,
		});
		this.detail = new TextRenderable(renderer, {
			content: "",
			fg: theme.textDim,
		});
		detailBox.add(this.detail);

		this.main.add(listBox);
		this.main.add(detailBox);
	}

	async activate(): Promise<void> {
		this.list.focus();
		if (!this.loaded) await this.load();
	}

	deactivate(): void {
		this.list.blur();
	}

	focusMain(): void {
		this.list.focus();
	}

	focusSidebar(): void {
		this.sidebar.focus();
	}

	async load(): Promise<void> {
		this.setStatus(`Loading ${this.source}…`);
		try {
			const packages =
				this.source === "casks"
					? await listInstalledCasks()
					: await listInstalledFormulae();
			this.list.setPackages(packages);
			this.loaded = true;
			this.setStatus(`${packages.length} ${this.source} installed`);
		} catch (err) {
			this.setStatus(
				`brew error: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	private showDetail(pkg: BrewPackage): void {
		this.detail.content = `${pkg.name}${pkg.version ? `  ${pkg.version}` : ""}`;
	}
}
