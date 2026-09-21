import type { KeyEvent } from "@opentui/core";

export type KeyBinding = {
	key: string;
	label: string;
	when?: () => boolean;
	action: (key: KeyEvent) => void;
};

export type KeyScope = {
	id: string;
	bindings: () => KeyBinding[];
};
