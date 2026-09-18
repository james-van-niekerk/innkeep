import type { Renderable } from "@opentui/core";

export interface View {
	readonly id: string;
	readonly mainTitle: string;
	readonly hints: string;

	readonly sidebar?: Renderable;
	readonly sidebarTitle?: string;
	readonly main: Renderable;

	activate(): void | Promise<void>;
	deactivate(): void;
	handleKey?(name: string): boolean;
	focusMain?(): void;
	focusSidebar?(): void;
}
