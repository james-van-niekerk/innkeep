import { expect, test } from "bun:test";
import { testRender } from "@opentui/solid";
import { App } from "./App";
import { SearchTab } from "./tabs/SearchTab";

test("the app shows all three tabs", async () => {
	const app = await testRender(() => <App />, { width: 80, height: 22 });
	await app.renderOnce();

	const screen = app.captureCharFrame();
	expect(screen).toContain("innkeep");
	expect(screen).toContain("Installed");
	expect(screen).toContain("Search");
	expect(screen).toContain("Ledgers");

	app.renderer.destroy();
});

test("the search tab draws an empty panel", async () => {
	const app = await testRender(() => <SearchTab />, { width: 40, height: 6 });
	await app.renderOnce();

	expect(app.captureCharFrame()).toContain("─ Search ─");

	app.renderer.destroy();
});
