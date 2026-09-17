import type { CliRenderer } from "@opentui/core";
import { createCliRenderer } from "@opentui/core";
import { listInstalledFormulae } from "../services/brew";
import { createHeader } from "./components/Header";
import { PackageList } from "./components/PackageList";
import { StatusBar } from "./components/StatusBar";

export class App {
	private readonly status: StatusBar;
	private readonly list: PackageList;

	private constructor(renderer: CliRenderer) {
		const header = createHeader(renderer);
		this.status = new StatusBar(renderer);
		this.list = new PackageList(renderer, (pkg) =>
			this.status.set(`Selected: ${pkg.name}`),
		);

		renderer.root.add(header);
		renderer.root.add(this.status.renderable);
		renderer.root.add(this.list.panel);

		renderer.keyInput.on("keypress", (key) => {
			if (key.name === "q") renderer.destroy();
			if (key.name === "r") void this.refresh();
		});
	}

	static async create(): Promise<App> {
		const renderer = await createCliRenderer({ exitOnCtrlC: true });
		return new App(renderer);
	}

	async start(): Promise<void> {
		this.list.focus();
		await this.refresh();
	}

	private async refresh(): Promise<void> {
		this.status.set("Loading installed formulae…");
		try {
			const formulae = await listInstalledFormulae();
			this.list.setPackages(formulae);
			this.status.set(`${formulae.length} formulae installed`);
		} catch (err) {
			this.status.set(
				`brew error: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}
}
