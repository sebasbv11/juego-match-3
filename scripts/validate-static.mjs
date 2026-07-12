import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await access(path.join(root, "index.html"));
await access(path.join(root, "manifest.webmanifest"));
await access(path.join(root, "sw.js"));
await access(path.join(root, "src", "styles.css"));
await access(path.join(root, "src", "app.js"));
await access(path.join(root, "src", "leaderboard.js"));
await access(path.join(root, "supabase", "gemquest_daily_leaderboard.sql"));
await import(pathToFileURL(path.join(root, "src", "gameLogic.js")).href);

const html = await readFile(path.join(root, "index.html"), "utf8");
if (
  !html.includes("./src/app.js") ||
  !html.includes("./src/styles.css") ||
  !html.includes("./manifest.webmanifest")
) {
  throw new Error("index.html must reference the application assets");
}

console.log("Static build validation passed");
