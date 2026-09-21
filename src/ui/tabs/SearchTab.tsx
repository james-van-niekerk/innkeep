import { useKeyboard } from "@opentui/solid";
import { createSignal } from "solid-js";
import { search, install, uninstall } from "../../services/brew";
import { borderStyle, theme } from "../theme";

type Pane = "input" | "results";

export function SearchTab() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<string[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [status, setStatus] = createSignal("");
  const [focusedPane, setFocusedPane] = createSignal<Pane>("input");

  const paneBorder = (pane: Pane) =>
    focusedPane() === pane ? theme.borderFocus : theme.border;

  const resultOptions = () =>
    searchResults().map((name) => ({ name, description: "" }));

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

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusedPane(focusedPane() === "input" ? "results" : "input");
    }
    const selected = searchResults()[selectedIndex()];
    if (!selected) return;
    if (key.name === "i") install(selected);
    if (key.name === "d") uninstall(selected);
  });

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
