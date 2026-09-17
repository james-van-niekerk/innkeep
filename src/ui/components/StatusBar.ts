import type { CliRenderer } from "@opentui/core";
import { TextRenderable } from "@opentui/core";

export class StatusBar {
	readonly renderable: TextRenderable;

	constructor(renderer: CliRenderer) {
		this.renderable = new TextRenderable(renderer, {
			content: "",
			fg: "#888888",
		});
	}

	set(text: string): void {
		this.renderable.content = text;
	}
}
