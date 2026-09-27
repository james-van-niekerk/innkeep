import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { install, search, uninstall } from "../../lib/brew";
import type { KeyboardService } from "../keyboard/keyboard";
import { borderStyle, theme } from "../theme";

type Pane = "input" | "results";
type BrewAction = "install" | "uninstall";

export function SearchTab(props: { keyboard: KeyboardService }) {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<string[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [status, setStatus] = createSignal("");
  const [focusedPane, setFocusedPane] = createSignal<Pane>("input");
  const [modalOpen, setModalOpen] = createSignal(false);
  const [modalTitle, setModalTitle] = createSignal("");
  const [modalOutput, setModalOutput] = createSignal<string[]>([]);
  const [modalError, setModalError] = createSignal<string | null>(null);
  const [brewRunning, setBrewRunning] = createSignal(false);

  const paneBorder = (pane: Pane) =>
    focusedPane() === pane ? theme.borderFocus : theme.border;

  createEffect(() => {
    props.keyboard.setInputFocused(focusedPane() === "input" && !modalOpen());
  });

  onCleanup(() => {
    props.keyboard.setInputFocused(false);
  });

  const resultOptions = () =>
    searchResults().map((name) => ({
      name,
      description: "",
    }));

  const selectedResult = () => searchResults()[selectedIndex()];

  const getSearchResults = async () => {
    const query = searchTerm().trim();

    if (!query) {
      setSearchResults([]);
      setStatus("Enter a search term");
      return;
    }

    setStatus("Fetching...");

    try {
      const results = await search(query);

      setSearchResults(results);
      setSelectedIndex(0);
      setStatus(`${results.length} results found`);

      if (results.length > 0) {
        setFocusedPane("results");
      }
    } catch (error) {
      setSearchResults([]);

      setStatus(error instanceof Error ? error.message : "Search failed");
    }
  };

  const runBrewAction = async (action: BrewAction, name: string) => {
    setModalTitle(
      action === "install" ? `Installing ${name}` : `Uninstalling ${name}`,
    );

    setModalOutput([]);
    setModalError(null);
    setModalOpen(true);
    setBrewRunning(true);

    try {
      const output = action === "install" ? install(name) : uninstall(name);

      for await (const line of output) {
        setModalOutput((lines) => [...lines, line]);
      }

      setModalOutput((lines) => [...lines, "", "✓ Completed successfully."]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      setModalError(message);

      setModalOutput((lines) => [...lines, "", "✗ Operation failed."]);
    } finally {
      setBrewRunning(false);
    }
  };

  const closeModal = () => {
    if (brewRunning()) {
      return;
    }

    setModalOpen(false);
    setModalOutput([]);
    setModalError(null);
  };

  createEffect(() => {
    props.keyboard.setActiveScope({
      id: "search",
      bindings: () => [
        {
          key: "escape",
          label: "close",
          when: () => modalOpen() && !brewRunning(),
          action: closeModal,
        },
        {
          key: "left",
          label: "pane",
          when: () => !modalOpen(),
          action: () => setFocusedPane("input"),
        },
        {
          key: "right",
          label: "pane",
          when: () => !modalOpen(),
          action: () => setFocusedPane("results"),
        },
        {
          key: "i",
          label: "install",
          when: () =>
            !modalOpen() && focusedPane() === "results" && !!selectedResult(),
          action: () => {
            const selected = selectedResult();

            if (selected) {
              void runBrewAction("install", selected);
            }
          },
        },
        {
          key: "d",
          label: "uninstall",
          when: () =>
            !modalOpen() && focusedPane() === "results" && !!selectedResult(),
          action: () => {
            const selected = selectedResult();

            if (selected) {
              void runBrewAction("uninstall", selected);
            }
          },
        },
      ],
    });
  });

  onCleanup(() => {
    props.keyboard.setActiveScope(null);
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
      {/* Search input */}
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
          focused={focusedPane() === "input" && !modalOpen()}
          style={{
            flexGrow: 1,
            flexBasis: 0,
            minWidth: 0,
          }}
          onInput={(event) => setSearchTerm(event)}
          onSubmit={() => void getSearchResults()}
        />
      </box>

      {/* Search results */}
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
          focused={focusedPane() === "results" && !modalOpen()}
          showDescription={false}
          backgroundColor={theme.panelBg}
          textColor={theme.text}
          selectedTextColor={theme.accent}
          style={{
            width: "100%",
            flexGrow: 1,
            minHeight: 0,
          }}
          onChange={(index) => setSelectedIndex(index)}
        />
      </box>

      {/* Brew output modal */}
      {modalOpen() && (
        <box
          title={` ${modalTitle()} `}
          borderStyle={borderStyle}
          borderColor={modalError() ? theme.error : theme.borderFocus}
          style={{
            position: "absolute",
            width: "80%",
            height: "80%",
            left: "10%",
            top: "10%",
            flexDirection: "column",
            backgroundColor: theme.panelBg,
            padding: 1,
          }}
        >
          <scrollbox
            stickyScroll={true}
            stickyStart="bottom"
            style={{
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <For each={modalOutput()}>{(line) => <text>{line}</text>}</For>
          </scrollbox>

          {/* Error */}
          {modalError() && (
            <box
              style={{
                flexShrink: 0,
                height: "auto",
                marginTop: 1,
              }}
            >
              <text>{`Error: ${modalError()}`}</text>
            </box>
          )}

          {/* Modal footer */}
          <box
            style={{
              flexShrink: 0,
              height: "auto",
              marginTop: 1,
              flexDirection: "row",
            }}
          >
            {brewRunning() ? (
              <text>Running... Please wait.</text>
            ) : modalError() ? (
              <text>Failed · Press Esc to close</text>
            ) : (
              <text>Completed · Press Esc to close</text>
            )}
          </box>
        </box>
      )}
    </box>
  );
}
