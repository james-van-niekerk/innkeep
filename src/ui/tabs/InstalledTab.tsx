import { useKeyboard } from "@opentui/solid";
import { createSignal } from "solid-js";
import { listInstalledCasks, listInstalledFormulae } from "../../services/brew";
import type { BrewPackage } from "../../types/brew";
import { borderStyle, theme } from "../theme";

type Source = "formulae" | "casks";
type Pane = "sidebar" | "main";

const SOURCES = [
	{ name: "Formulae", description: "" },
	{ name: "Casks", description: "" },
];

export function InstalledTab(props: { setStatus: (text: string) => void }) {
	const [source, setSource] = createSignal<Source>("formulae");
	const [packages, setPackages] = createSignal<BrewPackage[]>([]);
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [focusedPane, setFocusedPane] = createSignal<Pane>("main");

	async function loadPackages(next: Source = source()) {
		setSource(next);
		props.setStatus(`Loading ${next}…`);
		try {
			const found =
				next === "casks"
					? await listInstalledCasks()
					: await listInstalledFormulae();
			setPackages(found);
			setSelectedIndex(0);
			props.setStatus(`${found.length} ${next} installed`);
		} catch (error) {
			props.setStatus(
				`brew error: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	loadPackages();

	useKeyboard((key) => {
		if (key.name === "r") loadPackages();
		if (key.name === "tab")
			setFocusedPane(focusedPane() === "main" ? "sidebar" : "main");
	});

	const selectedPackage = () => packages()[selectedIndex()];

	const detailLine = () => {
		const pkg = selectedPackage();
		return pkg ? `${pkg.name}  ${pkg.version ?? ""}`.trim() : "";
	};

	const paneBorder = (pane: Pane) =>
		focusedPane() === pane ? theme.borderFocus : theme.border;

	const packageOptions = () =>
		packages().map((pkg) => ({
			name: pkg.name,
			description: pkg.version ?? "",
		}));

	return (
		<>
			<box
				title=" Sources "
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
					options={SOURCES}
					focused={focusedPane() === "sidebar"}
					showDescription={false}
					backgroundColor={theme.panelBg}
					textColor={theme.text}
					selectedTextColor={theme.accent}
					style={{ width: "100%", height: "100%" }}
					onSelect={(index) => loadPackages(index === 1 ? "casks" : "formulae")}
				/>
			</box>

			<box
				title=" Installed "
				borderStyle={borderStyle}
				borderColor={paneBorder("main")}
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
				<select
					options={packageOptions()}
					selectedIndex={selectedIndex()}
					focused={focusedPane() === "main"}
					showDescription
					backgroundColor={theme.panelBg}
					textColor={theme.text}
					selectedTextColor={theme.accent}
					descriptionColor={theme.textDim}
					style={{ width: "100%", flexGrow: 1, minHeight: 0 }}
					onChange={(index) => setSelectedIndex(index)}
				/>
				<box
					borderStyle={borderStyle}
					border={["top"]}
					borderColor={theme.border}
					style={{ width: "100%", height: 4, flexShrink: 0, paddingLeft: 1 }}
				>
					<text fg={theme.textDim}>{detailLine()}</text>
				</box>
			</box>
		</>
	);
}
