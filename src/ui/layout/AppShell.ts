import type { CliRenderer, Renderable } from "@opentui/core";
import {
	BoxRenderable,
	TabSelectRenderable,
	TabSelectRenderableEvents,
	TextRenderable,
} from "@opentui/core";
import { borderStyle, theme } from "../theme";

export interface ShellTab {
	id: string;
	name: string;
	description: string;
}

export class AppShell {
	readonly root: BoxRenderable;
	readonly sidebar: BoxRenderable;
	readonly main: BoxRenderable;

	private readonly tabs: TabSelectRenderable;
	private readonly statusText: TextRenderable;
	private readonly hintText: TextRenderable;

	constructor(
		renderer: CliRenderer,
		tabs: ShellTab[],
		private readonly onTabChange: (tab: ShellTab, index: number) => void,
	) {
		this.root = new BoxRenderable(renderer, {
			id: "shell",
			width: "100%",
			height: "100%",
			flexDirection: "column",
			backgroundColor: theme.bg,
			borderStyle,
			borderColor: theme.border,
			title: " innkeep ",
			titleAlignment: "left",
		});

		const header = new BoxRenderable(renderer, {
			id: "header",
			width: "100%",
			height: 2,
			flexShrink: 0,
			flexDirection: "row",
			backgroundColor: theme.bg,
		});

		const tabOptions = tabs.map((t) => ({
			name: t.name,
			description: t.description,
		}));

		this.tabs = new TabSelectRenderable(renderer, {
			id: "tabs",
			width: tabs.length * 14,
			height: 2,
			options: tabOptions,
			tabWidth: 14,
			showDescription: false,
			showUnderline: true,
			backgroundColor: theme.bg,
			textColor: theme.textDim,
			selectedTextColor: theme.accent,
			selectedBackgroundColor: theme.bg,
			focusedBackgroundColor: theme.bg,
			wrapSelection: true,
		});
		this.tabs.on(TabSelectRenderableEvents.SELECTION_CHANGED, (index) => {
			const tab = tabs[index];
			if (tab) this.onTabChange(tab, index);
		});
		header.add(this.tabs);
		// core 0.5.11: TabSelect paints its frame buffer only once marked dirty
		this.tabs.setOptions(tabOptions);

		const body = new BoxRenderable(renderer, {
			id: "body",
			width: "100%",
			flexGrow: 1,
			flexDirection: "row",
			minHeight: 0,
		});

		this.sidebar = new BoxRenderable(renderer, {
			id: "sidebar",
			width: 28,
			flexShrink: 0,
			height: "100%",
			flexDirection: "column",
			backgroundColor: theme.panelBg,
			borderStyle,
			borderColor: theme.border,
			overflow: "hidden",
		});

		this.main = new BoxRenderable(renderer, {
			id: "main",
			flexGrow: 1,
			flexBasis: 0,
			minWidth: 0,
			height: "100%",
			flexDirection: "column",
			backgroundColor: theme.panelBg,
			borderStyle,
			borderColor: theme.border,
			overflow: "hidden",
		});

		body.add(this.sidebar);
		body.add(this.main);

		const footer = new BoxRenderable(renderer, {
			id: "footer",
			width: "100%",
			height: 1,
			flexShrink: 0,
			flexDirection: "row",
			justifyContent: "space-between",
			paddingLeft: 1,
			paddingRight: 1,
			backgroundColor: theme.statusBg,
		});

		this.statusText = new TextRenderable(renderer, {
			content: "",
			fg: theme.textDim,
		});
		this.hintText = new TextRenderable(renderer, {
			content: "",
			fg: theme.textDim,
		});
		footer.add(this.statusText);
		footer.add(this.hintText);

		this.root.add(header);
		this.root.add(body);
		this.root.add(footer);
		renderer.root.add(this.root);
	}

	setStatus(text: string): void {
		this.statusText.content = text;
	}

	setHints(text: string): void {
		this.hintText.content = text;
	}

	setSidebarTitle(title: string): void {
		this.sidebar.title = ` ${title} `;
	}

	setMainTitle(title: string): void {
		this.main.title = ` ${title} `;
	}

	focusTabs(): void {
		this.tabs.focus();
	}

	selectTab(index: number): void {
		this.tabs.setSelectedIndex(index);
	}

	setSidebarVisible(visible: boolean): void {
		this.sidebar.visible = visible;
	}

	highlightPane(pane: "sidebar" | "main"): void {
		this.sidebar.borderColor =
			pane === "sidebar" ? theme.borderFocus : theme.border;
		this.main.borderColor = pane === "main" ? theme.borderFocus : theme.border;
	}

	mount(slot: "sidebar" | "main", child: Renderable): void {
		this[slot].add(child);
	}
}
