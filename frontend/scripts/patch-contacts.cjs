// The contacts plugin asks for READ and WRITE contacts, but StudyOS only reads them.
// Declaring only READ_CONTACTS in our manifest made Android reject the permission request.
// This keeps the app read-only: the plugin now asks for READ_CONTACTS alone.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "node_modules", "@capacitor-community", "contacts", "android", "src", "main", "java", "getcapacitor", "community", "contacts", "ContactsPlugin.java");
try {
  const src = fs.readFileSync(file, "utf8");
  const next = src.replace("strings = { Manifest.permission.READ_CONTACTS, Manifest.permission.WRITE_CONTACTS }", "strings = { Manifest.permission.READ_CONTACTS }");
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log("patched contacts plugin (read-only permission)");
  }
} catch (error) {
  console.log("contacts plugin patch skipped:", error.message);
}
