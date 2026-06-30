// scripts/generate.js

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

// --- Get version from package.json ---
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../package.json");
const version = pkg.version;

fs.writeFileSync(
  "./src/sw/version.ts",
  `export const VERSION = '${version}';\n`,
);
console.log(`✅ Generated version.ts with version: ${version}`);

// --- Get list of files from the build output directory ---
const folderPath = "./dist";

function getAllFilesInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFilesInDir(fullPath));
    } else {
      // We want paths relative to the dist folder, starting with "/"
      files.push("/" + path.relative(folderPath, fullPath).replace(/\\/g, "/"));
    }
  }
  return files;
}

// Make sure the dist folder exists
if (!fs.existsSync(folderPath)) {
  console.error("❌ dist folder not found. Run `npm run build` first.");
  process.exit(1);
}

const fileList = getAllFilesInDir(folderPath);

// Ensure the root "/" is always in the list
if (!fileList.includes("/")) {
  fileList.unshift("/");
}

// Write the file list
fs.writeFileSync(
  "./src/sw/app-file-list.ts",
  `export const APP_FILE_LIST = [\n  "${fileList.join('",\n  "')}"\n];\n`,
);
console.log(`✅ Generated app-file-list.ts with ${fileList.length} files.`);
