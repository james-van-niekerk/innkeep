import { render } from "@opentui/solid";
import { App } from "./src/ui/App";

await render(() => <App />, { exitOnCtrlC: true });
