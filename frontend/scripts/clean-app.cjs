// Removes website-only files from the phone app bundle.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "dist-app");
for (const f of ["privacy.html", "sw.js", "manifest.webmanifest", "design"]) {
  fs.rmSync(path.join(dir, f), { recursive: true, force: true });
}
console.log("phone app bundle cleaned");
