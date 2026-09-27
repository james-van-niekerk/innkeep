import { readdir } from "node:fs/promises";

console.log(await readdir("some-real-folder"))
