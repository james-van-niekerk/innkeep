import type { TextareaRenderable } from "@opentui/core";
import { useRenderer } from "@opentui/solid";
import { createEffect, createSignal, onCleanup } from "solid-js";
import {
	listLedgers,
	openLedgerInEditor,
	readLedger,
	writeLedger,
} from "../../lib/ledger";
import type { LedgerFile } from "../../types/ledger";
import type { KeyboardService } from "../keyboard/keyboard";
import { borderStyle, theme } from "../theme";

type Pane = "sidebar" | "editor";

export function LedgersTab(props: {
	setStatus: (text: string) => void;
	keyboard: KeyboardService;
}) {
	const renderer = useRenderer();

	const [ledgers, setLedgers] = createSignal<LedgerFile[]>([]);
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [focusedPane, setFocusedPane] = createSignal<Pane>("sidebar");
	const [dirty, setDirty] = createSignal(false);

	let editor!: TextareaRenderable;

	const selectedLedger = () => ledgers()[selectedIndex()];

	function showText(text: string) {
		editor.setText(text);
		setDirty(false);
	}

	async function loadLedgers() {
		try {
			const found = await listLedgers();
			setLedgers(found);
			setSelectedIndex(0);
			props.setStatus(`${found.length} ledgers`);
			await loadSelected();
		} catch (error) {
			props.setStatus(`ledger error: ${errorMessage(error)}`);
		}
	}

	async function loadSelected() {
		const ledger = selectedLedger();
		if (!ledger) {
			showText("");
			return;
		}
		try {
			showText(await readLedger(ledger.path));
		} catch (error) {
			props.setStatus(`ledger error: ${errorMessage(error)}`);
		}
	}

	async function save() {
		const ledger = selectedLedger();
		if (!ledger) return;
		try {
			await writeLedger(ledger.path, editor.plainText);
			setDirty(false);
			props.setStatus(`Saved ${ledger.name}`);
		} catch (error) {
			props.setStatus(`save failed: ${errorMessage(error)}`);
		}
	}

	async function editExternally() {
		const ledger = selectedLedger();
		if (!ledger) return;
		renderer.suspend();
		try {
			await openLedgerInEditor(ledger.path);
		} catch (error) {
			props.setStatus(`editor error: ${errorMessage(error)}`);
		} finally {
			renderer.resume();
		}
		await loadSelected();
	}

	function selectLedger(index: number) {
		setSelectedIndex(index);
		loadSelected();
	}

	loadLedgers();

	createEffect(() => {
		props.keyboard.setInputFocused(focusedPane() === "editor");
	});
	onCleanup(() => props.keyboard.setInputFocused(false));

	createEffect(() => {
		const inSidebar = () => focusedPane() === "sidebar";
		const hasLedger = () => !!selectedLedger();

		props.keyboard.setActiveScope({
			id: "ledgers",
			bindings: () => [
				{
					key: "r",
					label: "reload",
					when: inSidebar,
					action: () => loadLedgers(),
				},
				{
					key: "e",
					label: "$EDITOR",
					when: () => inSidebar() && hasLedger(),
					action: () => editExternally(),
				},
				{
					key: "right",
					label: "edit",
					when: () => inSidebar() && hasLedger(),
					action: () => setFocusedPane("editor"),
				},
				{
					key: "escape",
					label: "back",
					when: () => focusedPane() === "editor",
					action: () => setFocusedPane("sidebar"),
				},
			],
		});
	});
	onCleanup(() => props.keyboard.setActiveScope(null));

	const paneBorder = (pane: Pane) =>
		focusedPane() === pane ? theme.borderFocus : theme.border;

	const ledgerOptions = () =>
		ledgers().map((ledger) => ({ name: ledger.name, description: "" }));

	const editorTitle = () => {
		const ledger = selectedLedger();
		if (!ledger) return " Ledger ";
		return ` ${ledger.name}${dirty() ? " *" : ""} `;
	};

	return (
		<>
			<box
				title=" Ledgers "
				borderStyle={borderStyle}
				borderColor={paneBorder("sidebar")}
				style={{
					width: 28,
					flexShrink: 0,
					height: "100%",
					flexDirection: "column",
					backgroundColor: theme.panelBg,
					overflow: "hidden",
				}}
			>
				<select
					options={ledgerOptions()}
					selectedIndex={selectedIndex()}
					focused={focusedPane() === "sidebar"}
					showDescription={false}
					backgroundColor={theme.panelBg}
					textColor={theme.text}
					selectedTextColor={theme.accent}
					style={{ width: "100%", height: "100%" }}
					onChange={(index) => selectLedger(index)}
					onSelect={() => {
						if (selectedLedger()) setFocusedPane("editor");
					}}
				/>
			</box>

			<box
				title={editorTitle()}
				borderStyle={borderStyle}
				borderColor={paneBorder("editor")}
				style={{
					flexGrow: 1,
					flexBasis: 0,
					minWidth: 0,
					height: "100%",
					flexDirection: "column",
					backgroundColor: theme.panelBg,
					overflow: "hidden",
				}}
			>
				<textarea
					ref={editor}
					focused={focusedPane() === "editor"}
					placeholder="No ledger selected"
					wrapMode="none"
					backgroundColor={theme.panelBg}
					focusedBackgroundColor={theme.panelBg}
					textColor={theme.text}
					focusedTextColor={theme.text}
					cursorColor={theme.accent}
					keyBindings={[{ name: "s", ctrl: true, action: "submit" }]}
					onSubmit={() => save()}
					onContentChange={() => setDirty(true)}
					style={{ width: "100%", flexGrow: 1, minHeight: 0 }}
				/>
			</box>
		</>
	);
}

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}
