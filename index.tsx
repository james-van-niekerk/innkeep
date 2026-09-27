import { render } from "@opentui/solid";
import { loadConfig } from "./src/lib/config";
import { App } from "./src/ui/App";
import { applyTheme } from "./src/ui/theme";

const config = await loadConfig();
applyTheme(config.theme);

await render(() => <App />, { exitOnCtrlC: true });
