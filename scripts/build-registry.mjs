#!/usr/bin/env node
/**
 * build-registry.mjs
 *
 * Walks registry/*.json (excluding index.json, VERSIONING.md, registry.json),
 * validates each file against the shadcn registry-item schema shape, embeds
 * the actual source file content into each registry item's `files[].content`
 * field so the shadcn CLI can copy files from a raw-GitHub endpoint, then
 * regenerates registry/index.json from the individual files.
 *
 * Usage:
 *   node scripts/build-registry.mjs
 *
 * Add new components by:
 *   1. Dropping a <name>.json stub in registry/
 *   2. Ensuring files[].path points to the actual source file
 *   3. Running this script — content is embedded automatically
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REGISTRY_DIR = resolve(ROOT, "registry");
const INDEX_PATH = resolve(REGISTRY_DIR, "index.json");
const RAW_BASE =
  "https://raw.githubusercontent.com/elpiarthera/vantage-video-components/main/registry";

// ---------------------------------------------------------------------------
// Minimal validation against shadcn registry-item schema requirements.
// Full JSON Schema validation would require ajv + network fetch; we validate
// the required fields inline to keep the script zero-dependency.
// ---------------------------------------------------------------------------
const REQUIRED_ITEM_FIELDS = ["name", "type", "files"];
const VALID_TYPES = [
  "registry:component",
  "registry:hook",
  "registry:lib",
  "registry:block",
  "registry:page",
  "registry:ui",
  "registry:theme",
  "registry:style",
];
const VALID_FILE_TYPES = [
  "registry:component",
  "registry:hook",
  "registry:lib",
  "registry:block",
  "registry:page",
  "registry:ui",
];

/**
 * Validate a single registry item JSON object.
 * Returns an array of error strings (empty = valid).
 */
function validateItem(item, filename) {
  const errors = [];

  for (const field of REQUIRED_ITEM_FIELDS) {
    if (item[field] === undefined) {
      errors.push(`Missing required field "${field}"`);
    }
  }

  if (item.type && !VALID_TYPES.includes(item.type)) {
    errors.push(
      `Invalid type "${item.type}". Must be one of: ${VALID_TYPES.join(", ")}`,
    );
  }

  if (item.name && item.name !== basename(filename, ".json")) {
    errors.push(
      `"name" field "${item.name}" does not match filename "${basename(filename)}"`,
    );
  }

  if (Array.isArray(item.files)) {
    for (let i = 0; i < item.files.length; i++) {
      const file = item.files[i];
      if (!file.path) {
        errors.push(`files[${i}] missing required "path" field`);
      }
      if (!file.type) {
        errors.push(`files[${i}] missing required "type" field`);
      } else if (!VALID_FILE_TYPES.includes(file.type)) {
        errors.push(
          `files[${i}].type "${file.type}" is not a valid registry file type`,
        );
      }
      if (!file.target) {
        errors.push(`files[${i}] missing recommended "target" field`);
      }
    }
  }

  return errors;
}

/**
 * Embed the actual source file content into each files[] entry.
 * This allows the shadcn CLI to copy files from a raw-GitHub endpoint.
 * Returns the enriched item (original is not mutated).
 */
function embedContent(item) {
  const enrichedFiles = item.files.map((file) => {
    // Already has content embedded — skip
    if (file.content) return file;

    const sourcePath = resolve(ROOT, file.path);
    if (!existsSync(sourcePath)) {
      console.warn(
        `  [WARN] Source file not found, skipping content embed: ${file.path}`,
      );
      return file;
    }

    const content = readFileSync(sourcePath, "utf8");
    return { ...file, content };
  });

  return { ...item, files: enrichedFiles };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const allFiles = readdirSync(REGISTRY_DIR);
  const componentFiles = allFiles
    .filter(
      (f) =>
        extname(f) === ".json" && f !== "index.json" && f !== "registry.json",
    )
    .sort();

  if (componentFiles.length === 0) {
    console.error("No component JSON files found in registry/");
    process.exit(1);
  }

  let hasErrors = false;
  const items = [];

  for (const filename of componentFiles) {
    const filePath = resolve(REGISTRY_DIR, filename);
    let item;

    try {
      item = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (err) {
      console.error(`[FAIL] ${filename}: JSON parse error — ${err.message}`);
      hasErrors = true;
      continue;
    }

    const errors = validateItem(item, filename);
    if (errors.length > 0) {
      console.error(`[FAIL] ${filename}:`);
      for (const e of errors) {
        console.error(`       - ${e}`);
      }
      hasErrors = true;
    } else {
      // Embed content and write back the enriched per-component file
      const enriched = embedContent(item);
      writeFileSync(filePath, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
      console.log(`[ OK ] ${filename} (content embedded)`);
    }

    items.push({
      name: item.name,
      type: item.type,
      description: item.description ?? "",
      url: `${RAW_BASE}/${filename}`,
    });
  }

  if (hasErrors) {
    console.error(
      "\nValidation failed. Fix the errors above before regenerating index.json.",
    );
    process.exit(1);
  }

  // Read existing index to preserve top-level metadata fields
  let existingIndex = {};
  try {
    existingIndex = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
  } catch {
    // index may not exist yet; that is fine
  }

  const index = {
    $schema:
      existingIndex.$schema ?? "https://ui.shadcn.com/schema/registry.json",
    name: existingIndex.name ?? "vantage-video-components",
    homepage:
      existingIndex.homepage ??
      "https://github.com/elpiarthera/vantage-video-components",
    items,
  };

  writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(
    `\nregenerated registry/index.json — ${items.length} component(s)`,
  );
}

main();
