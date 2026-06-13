/**
 * One-shot render script for Phase 2 Batch 2 previews.
 * Bundles Root.tsx with `@` → project root alias, renders 5 compositions.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, getCompositions, renderMedia } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = "/root/coding/vantage-video-components";

const B2_COMPOSITIONS = [
  { id: "TrackingInSample", outName: "tracking-in" },
  { id: "SlotMachineRollSample", outName: "slot-machine-roll" },
  { id: "MatrixDecodeSample", outName: "matrix-decode" },
  { id: "RGBGlitchTextSample", outName: "rgb-glitch-text" },
  { id: "StrikethroughReplaceSample", outName: "strikethrough-replace" },
];

async function main() {
  const entryPoint = path.join(root, "src", "remotion", "Root.tsx");
  const outDir = path.join(root, "site", "public", "previews");

  await ensureBrowser();

  console.log("Bundling Root.tsx with @-alias…");
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(typeof config.resolve?.alias === "object" && !Array.isArray(config.resolve.alias)
            ? config.resolve.alias
            : {}),
          "@": root,
        },
      },
    }),
  });
  console.log("Bundle ready.");

  const allComps = await getCompositions(serveUrl);
  const b2Comps = B2_COMPOSITIONS.map((b) => {
    const comp = allComps.find((c) => c.id === b.id);
    if (!comp) throw new Error(`Composition not found: ${b.id}`);
    return { comp, outName: b.outName };
  });

  for (const { comp, outName } of b2Comps) {
    const outputLocation = path.join(outDir, `${outName}.mp4`);
    console.log(`Rendering ${comp.id} → ${outputLocation}`);
    await renderMedia({
      serveUrl,
      composition: comp,
      codec: "h264",
      outputLocation,
      concurrency: 1,
      imageFormat: "jpeg",
      jpegQuality: 80,
      crf: 28,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r  ${Math.round(progress * 100)}%   `);
      },
    });
    process.stdout.write("\r  100% done\n");
    const { statSync } = await import("node:fs");
    const size = Math.round(statSync(outputLocation).size / 1024);
    console.log(`  Size: ${size}KB`);
  }

  console.log("All B2 previews rendered.");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
