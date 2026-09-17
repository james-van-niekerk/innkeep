import { TextRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

const title = new TextRenderable(renderer, {
  content: "Innkeep",
  fg: "#FFFFFF",
})

const subtitle = new TextRenderable(renderer, {
  content: "TUI for Homebrew — save, reinstall, and maintain your setup. Press q to quit.",
  fg: "#888888",
})

renderer.root.add(title)
renderer.root.add(subtitle)

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "q") {
    renderer.destroy()
  }
})
