import type { CliRenderer } from "@opentui/core";
import { TextRenderable } from "@opentui/core";

export function createHeader(renderer: CliRenderer): TextRenderable {
	return new TextRenderable(renderer, {
		content: "Innkeep — press r to refresh, q to quit",
		fg: "#FFFFFF",
	});
}
