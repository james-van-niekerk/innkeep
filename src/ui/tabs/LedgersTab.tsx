import { borderStyle, theme } from "../theme";

export function LedgersTab() {
	return (
		<box
			title=" Ledgers "
			borderStyle={borderStyle}
			borderColor={theme.border}
			style={{
				flexGrow: 1,
				height: "100%",
				flexDirection: "column",
				backgroundColor: theme.panelBg,
				overflow: "hidden",
			}}
		/>
	);
}
