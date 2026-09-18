import type { CliRenderer} from "@opentui/core";
import { BoxRenderable } from "@opentui/core";
import type { View } from "./View";

export class SearchView implements View {
	readonly id = "search";
	readonly mainTitle = "Search";
  readonly hints = "q quit";

	readonly main: BoxRenderable;

	constructor(
		renderer: CliRenderer,
		private readonly setStatus: (text: string) => void,
	) {
		this.main = new BoxRenderable(renderer, {
			id: "search-main",
			width: "100%",
			height: "100%",
			flexDirection: "column",
    });
  }

	activate(): void {
		this.setStatus("");
	}

	deactivate(): void {}
}
