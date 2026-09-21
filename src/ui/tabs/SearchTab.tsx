import { createEffect, createSignal, onCleanup } from "solid-js";
import { install, search, uninstall } from "../../services/brew";
import type { KeyboardService } from "../keyboard/keyboard";
import { borderStyle, theme } from "../theme";

type Pane = "input" | "results";

export function SearchTab(props: { keyboard: KeyboardService }) {
	const [searchTerm, setSearchTerm] = createSignal("");
	const [searchResults, setSearchResults] = createSignal<string[]>([]);
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [status, setStatus] = createSignal("");
	const [focusedPane, setFocusedPane] = createSignal<Pane>("input");

	const paneBorder = (pane: Pane) =>
		focusedPane() === pane ? theme.borderFocus : theme.border;

	createEffect(() => {
		props.keyboard.setInputFocused(focusedPane() === "input");
	});
	onCleanup(() => props.keyboard.setInputFocused(false));

	const resultOptions = () =>
		searchResults().map((name) => ({ name, description: "" }));

	const selectedResult = () => searchResults()[selectedIndex()];

	const getSearchResults = async () => {
		setStatus("Fetching...");
		try {
			const results = await search(searchTerm());
			setSearchResults(results);
			setSelectedIndex(0);
			setStatus(`${results.length} results found`);
			if (results.length > 0) setFocusedPane("results");
		} catch {
			setSearchResults([]);
			setStatus("Search Failed");
		}
	};

	createEffect(() => {
		props.keyboard.setActiveScope({
			id: "search",
			bindings: () => [
				{
					key: "left",
					label: "pane",
					action: () => setFocusedPane("input"),
				},
				{
					key: "right",
					label: "pane",
					action: () => setFocusedPane("results"),
				},
				{
					key: "i",
					label: "install",
					when: () => focusedPane() === "results" && !!selectedResult(),
					action: () => {
						const selected = selectedResult();
						if (selected) install(selected);
					},
				},
				{
					key: "d",
					label: "uninstall",
					when: () => focusedPane() === "results" && !!selectedResult(),
					action: () => {
						const selected = selectedResult();
						if (selected) uninstall(selected);
					},
				},
			],
		});
	});
	onCleanup(() => props.keyboard.setActiveScope(null));

	return (
		<box
			title=" Search "
			borderStyle={borderStyle}
			borderColor={theme.border}
			style={{
				flexGrow: 1,
				height: "100%",
				flexDirection: "column",
				backgroundColor: theme.panelBg,
				overflow: "hidden",
			}}
		>
			<box
				borderStyle={borderStyle}
				borderColor={paneBorder("input")}
				style={{
					height: "auto",
					flexShrink: 0,
					flexDirection: "row",
					backgroundColor: theme.panelBg,
					overflow: "hidden",
				}}
			>
				<input
					focused={focusedPane() === "input"}
					style={{
						flexGrow: 1,
						flexBasis: 0,
						minWidth: 0,
					}}
					onInput={(event) => setSearchTerm(event)}
					onSubmit={() => getSearchResults()}
				/>
			</box>
			<box
				title={status()}
				borderStyle={borderStyle}
				borderColor={paneBorder("results")}
				style={{
					flexGrow: 1,
					flexBasis: 0,
					minHeight: 0,
					flexDirection: "column",
					backgroundColor: theme.panelBg,
					overflow: "hidden",
				}}
			>
				<select
					options={resultOptions()}
					selectedIndex={selectedIndex()}
					focused={focusedPane() === "results"}
					showDescription={false}
					backgroundColor={theme.panelBg}
					textColor={theme.text}
					selectedTextColor={theme.accent}
					style={{ width: "100%", flexGrow: 1, minHeight: 0 }}
					onChange={(index) => setSelectedIndex(index)}
				/>
			</box>
		</box>
	);
}
