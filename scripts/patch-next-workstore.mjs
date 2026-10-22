import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "node_modules/next/dist/esm/lib/metadata/resolve-metadata.js",
  "node_modules/next/dist/lib/metadata/resolve-metadata.js",
];

const metadataCall =
  /const metadataItems = await resolveMetadataItems\(([\s\S]*?)\);\r?\n(\s*)const workStore = ((?:[\w$]+\.)*workAsyncStorage)\.getStore\(\);/;
const reorderedCall =
  /const workStore = ((?:[\w$]+\.)*workAsyncStorage)\.getStore\(\);\r?\n\s*const metadataItems = await resolveMetadataItems\(/;

for (const file of files) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected Next.js metadata module was not found: ${file}`);
  }

  const source = fs.readFileSync(filePath, "utf8");
  if (reorderedCall.test(source)) continue;

  const match = source.match(metadataCall);
  if (!match) {
    throw new Error(`Next.js metadata code changed; cannot safely patch ${file}`);
  }

  const replacement =
    `const workStore = ${match[3]}.getStore();\n` +
    `${match[2]}const metadataItems = await resolveMetadataItems(${match[1]});`;
  fs.writeFileSync(filePath, source.replace(metadataCall, replacement));
}

console.log("Applied Next.js prerender workStore compatibility patch.");
