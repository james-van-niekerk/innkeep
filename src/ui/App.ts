import type { CliRenderer } from "@opentui/core";
import { createCliRenderer } from "@opentui/core";
import { AppShell, type ShellTab } from "./layout/AppShell";
import { InstalledView } from "./views/InstalledView";
import { SearchView } from "./views/SearchView";
import type { View } from "./views/View";

const TABS: ShellTab[] = [
	{
		id: "installed",
		name: "Installed",
		description: "Installed formulae and casks",
	},
  {
    id: "search",
    name: "Search",
    description: "Browse formulae and casks"
  },
  {
    id:"ledgers",
    name: "Ledgers",
    description: "Configure ledgers"
  },
];

export class App {
	private readonly shell: AppShell;
	private readonly views: View[];
	private active: View;
	private pane: "sidebar" | "main" = "main";
	private tabIndex = 0;

	private constructor(private readonly renderer: CliRenderer) {
		this.shell = new AppShell(
			renderer,
			TABS,
			(_tab, index) => void this.switchTo(index),
		);

		const installed = new InstalledView(renderer, (text) =>
			this.shell.setStatus(text),
    );

    const search = new SearchView(renderer, (text) =>
      this.shell.setStatus(text)
    );

    const ledger = new LedgerView(renderer, (text) =>
      this.shell.setStatus(text)
    );

		this.views = [
			installed,
			search,
			ledger
		];

		for (const view of this.views) {
			if (view.sidebar) this.shell.mount("sidebar", view.sidebar);
			this.shell.mount("main", view.main);
			if (view.sidebar) view.sidebar.visible = false;
			view.main.visible = false;
		}

		this.active = installed;
		this.renderer.keyInput.on("keypress", (key) => this.onKey(key.name));
	}

	static async create(): Promise<App> {
		const renderer = await createCliRenderer({ exitOnCtrlC: true });
		return new App(renderer);
	}

	async start(): Promise<void> {
		await this.showView(this.active);
	}

	private async switchTo(index: number): Promise<void> {
		const next = this.views[index];
		if (!next || next === this.active) return;
		this.active.deactivate();
		if (this.active.sidebar) this.active.sidebar.visible = false;
		this.active.main.visible = false;
		this.active = next;
		await this.showView(next);
	}

	private async showView(view: View): Promise<void> {
		const hasSidebar = !!view.sidebar;
		this.shell.setSidebarVisible(hasSidebar);
		if (view.sidebar) {
			view.sidebar.visible = true;
			this.shell.setSidebarTitle(view.sidebarTitle ?? "");
		}
		view.main.visible = true;
		this.shell.setMainTitle(view.mainTitle);
		this.shell.setHints(view.hints);
		if (!hasSidebar) this.pane = "main";
		this.shell.highlightPane(this.pane);
		await view.activate();
	}

	private onKey(name: string): void {
		if (this.active.handleKey?.(name)) return;

		switch (name) {
			case "q":
				this.renderer.destroy();
				return;
			case "tab":
				this.togglePane();
				return;
			case "[":
				this.moveTab(-1);
				return;
			case "]":
				this.moveTab(1);
				return;
			case "1":
			case "2":
			case "3":
				this.tabIndex = Number(name) - 1;
				this.shell.selectTab(this.tabIndex);
				return;
		}
	}

	private moveTab(delta: number): void {
		this.tabIndex =
			(this.tabIndex + delta + this.views.length) % this.views.length;
		this.shell.selectTab(this.tabIndex);
	}

	private togglePane(): void {
		if (!this.active.sidebar) return;
		this.pane = this.pane === "main" ? "sidebar" : "main";
		this.shell.highlightPane(this.pane);
		if (this.pane === "main") this.active.focusMain?.();
		else this.active.focusSidebar?.();
	}
}
