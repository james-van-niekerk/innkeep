import type { KeyEvent } from "@opentui/core";
import { createSignal } from "solid-js";
import type { KeyBinding, KeyScope } from "./types";

export function createKeyboardService() {
	const [globalBindings, setGlobalBindings] = createSignal<KeyBinding[]>([]);
	const [scope, setScope] = createSignal<KeyScope | null>(null);
	const [inputFocused, setInputFocused] = createSignal(false);

	function registerGlobal(bindings: KeyBinding[]) {
		setGlobalBindings(bindings);
	}

	function setActiveScope(next: KeyScope | null) {
		setScope(next);
	}

	function activeBindings(): KeyBinding[] {
		return [...(scope()?.bindings() ?? []), ...globalBindings()];
	}

	function handleKey(key: KeyEvent) {
		for (const binding of activeBindings()) {
			if (binding.key !== key.name) continue;
			if (binding.when && !binding.when()) continue;
			key.preventDefault();
			binding.action(key);
			return;
		}
	}

	function hints() {
		const grouped = new Map<string, string[]>();
		for (const binding of activeBindings()) {
			const keys = grouped.get(binding.label) ?? [];
			keys.push(binding.key);
			grouped.set(binding.label, keys);
		}
		return [...grouped.entries()]
			.map(([label, keys]) => `${keys.join("/")} ${label}`)
			.join(" · ");
	}

	return {
		registerGlobal,
		setActiveScope,
		handleKey,
		hints,
		setInputFocused,
		isInputFocused: inputFocused,
	};
}

export type KeyboardService = ReturnType<typeof createKeyboardService>;
