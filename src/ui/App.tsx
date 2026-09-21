import type { TabSelectRenderable } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { createSignal, Match, Switch } from "solid-js";
import { createKeyboardService } from "./keyboard/keyboard";
import { InstalledTab } from "./tabs/InstalledTab";
import { LedgersTab } from "./tabs/LedgersTab";
import { SearchTab } from "./tabs/SearchTab";
import { borderStyle, theme } from "./theme";

const TABS = [
	{ name: "Installed", description: "Installed formulae and casks" },
	{ name: "Search", description: "Browse formulae and casks" },
	{ name: "Ledgers", description: "Configure ledgers" },
];

export function App() {
	const renderer = useRenderer();
	const keyboard = createKeyboardService();

	const [activeTab, setActiveTab] = createSignal(0);
	const [status, setStatus] = createSignal("");

	let tabBar!: TabSelectRenderable;

	function showTab(index: number) {
		if (index === activeTab()) return;
		setStatus("");
		setActiveTab(index);
		tabBar.setSelectedIndex(index);
	}

	function nextTab() {
		showTab((activeTab() + 1) % TABS.length);
	}

	const notTyping = () => !keyboard.isInputFocused();

	keyboard.registerGlobal([
		{
			key: "q",
			label: "quit",
			when: notTyping,
			action: () => renderer.destroy(),
		},
		{ key: "tab", label: "next tab", action: () => nextTab() },
	]);

	useKeyboard((key) => keyboard.handleKey(key));

	return (
		<box
			title=" innkeep "
			titleAlignment="left"
			borderStyle={borderStyle}
			borderColor={theme.border}
			style={{
				width: "100%",
				height: "100%",
				flexDirection: "column",
				backgroundColor: theme.bg,
			}}
		>
			<box
				style={{
					width: "100%",
					height: 2,
					flexShrink: 0,
					flexDirection: "row",
					backgroundColor: theme.bg,
				}}
			>
				<tab_select
					ref={tabBar}
					options={TABS}
					onChange={(index) => showTab(index)}
					tabWidth={14}
					showDescription={false}
					showUnderline
					backgroundColor={theme.bg}
					textColor={theme.textDim}
					selectedTextColor={theme.accent}
					selectedBackgroundColor={theme.bg}
					focusedBackgroundColor={theme.bg}
					style={{ width: TABS.length * 14, height: 2 }}
				/>
			</box>

			<box
				style={{
					width: "100%",
					flexGrow: 1,
					minHeight: 0,
					flexDirection: "row",
				}}
			>
				<Switch>
					<Match when={activeTab() === 0}>
						<InstalledTab setStatus={setStatus} keyboard={keyboard} />
					</Match>
					<Match when={activeTab() === 1}>
						<SearchTab keyboard={keyboard} />
					</Match>
					<Match when={activeTab() === 2}>
						<LedgersTab />
					</Match>
				</Switch>
			</box>

			<box
				style={{
					width: "100%",
					height: 1,
					flexShrink: 0,
					flexDirection: "row",
					justifyContent: "space-between",
					paddingLeft: 1,
					paddingRight: 1,
					backgroundColor: theme.statusBg,
				}}
			>
				<text fg={theme.textDim}>{status()}</text>
				<text fg={theme.textDim}>{keyboard.hints()}</text>
			</box>
		</box>
	);
}
