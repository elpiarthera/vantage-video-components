"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const markerHighlightSchema = z.object({
  text: z.string(),
  highlightWord: z.string(),
  markerColor: z.string().default("oklch(0.74 0.16 60 / 0.35)"),
  textShiftColor: z.string().default("#0a0a0a"),
  drawFrames: z.number().int().min(8).max(40).default(18),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type MarkerHighlightProps = z.infer<typeof markerHighlightSchema> & {
  /** Optional: frame at which the marker draw begins. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Default for marker draw — pen-on-paper weight.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
// markerColor default: amber accent at 35% opacity (one accent per scene rule)
// oklch(0.74 0.16 60 / 0.35) → warm amber overlay
const BRAND_MARKER_FALLBACK = "rgba(245, 158, 11, 0.35)"; // hex amber at 35% opacity

// ---------------------------------------------------------------------------
// Helper — resolve oklch() with alpha to rgba() fallback
// ---------------------------------------------------------------------------

function resolveOklchWithAlpha(color: string, fallback: string): string {
  // oklch() with slash-alpha syntax (e.g., oklch(0.74 0.16 60 / 0.35))
  // is widely supported but not in older webkit — provide fallback for render
  if (color.startsWith("oklch(")) {
    return fallback;
  }
  return color;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * MarkerHighlight — draws a semi-transparent highlight band over a word as if
 * hand-marked with a felt-tip marker, expanding left-to-right over `drawFrames`.
 * Text color shifts to `textShiftColor` as the marker covers the word.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Body text: --vantage-warm-white (#e8e0d0) — never pure white
 * - Marker: amber accent at 35% opacity — BRAND.md Rule 1 (one accent per scene)
 * - Text on marker: --vantage-bg (#0a0a0a) — high contrast reversal
 * - Font: Georgia (body text, BRAND.md Rule 2 — Georgia below 56px)
 * - Easing: literary (pen-on-paper weight feel)
 *
 * Remotion primitives: AbsoluteFill + useCurrentFrame + interpolate + interpolateColors.
 * No @remotion/transitions TransitionSeries API used.
 */
export function MarkerHighlight({
  text,
  highlightWord,
  markerColor = "oklch(0.74 0.16 60 / 0.35)",
  textShiftColor = "#0a0a0a",
  drawFrames = 18,
  easing = "literary",
  startFrame = 0,
}: MarkerHighlightProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const localFrame = Math.max(0, frame - startFrame);

  // Marker draw progress: 0 (not started) → 1 (fully drawn)
  const markerProgress = interpolate(localFrame, [0, drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // Text color shifts from body color to textShiftColor as marker appears
  // Shift begins once marker is 40% drawn (the text becomes visible under marker)
  const textColorProgress = interpolate(markerProgress, [0.4, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shiftedTextColor = interpolateColors(
    textColorProgress,
    [0, 1],
    [BRAND_WARM_WHITE, textShiftColor],
  );

  const resolvedMarkerColor = resolveOklchWithAlpha(
    markerColor,
    BRAND_MARKER_FALLBACK,
  );

  // Split text around the highlighted word (first occurrence)
  const wordIndex = text.indexOf(highlightWord);
  const before = wordIndex >= 0 ? text.slice(0, wordIndex) : text;
  const after =
    wordIndex >= 0 ? text.slice(wordIndex + highlightWord.length) : "";
  const displayWord = wordIndex >= 0 ? highlightWord : "";

  return (
    <AbsoluteFill
      style={{
        background: BRAND_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
      }}
    >
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 48,
          fontWeight: 400,
          color: BRAND_WARM_WHITE,
          letterSpacing: 0,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {before}
        <span
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          {/* Marker band — draws left-to-right via scaleX */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "0.05em",
              bottom: "0.05em",
              left: "-0.08em",
              right: "-0.08em",
              background: resolvedMarkerColor,
              transformOrigin: "left center",
              transform: `scaleX(${markerProgress})`,
              zIndex: 0,
              borderRadius: "2px",
            }}
          />
          {/* Word text — shifts color as marker covers it */}
          <span
            style={{
              position: "relative",
              zIndex: 1,
              color: shiftedTextColor,
            }}
          >
            {displayWord}
          </span>
        </span>
        {after}
      </span>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "marker-highlight",
  type: "registry:component" as const,
  description:
    "Draws a semi-transparent marker highlight band over a word, left-to-right, with text color reversal. Literary easing default, BRAND.md amber accent aligned.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/marker-highlight/marker-highlight.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/marker-highlight.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default MarkerHighlight;
