/**
 * Copy sql.js wasm next to the web app so locateFile never hits the CDN.
 * Keeps JS (bundled) and wasm (served from /public) on the same version.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "sql.js", "dist", "sql-wasm.wasm");
const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "sql-wasm.wasm");

if (!fs.existsSync(src)) {
  console.warn("[copy-sqljs-wasm] skip: not found", src);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[copy-sqljs-wasm] copied to", dest);
