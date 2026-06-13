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

export const inlineHighlightSchema = z.object({
  text: z.string(),
  highlightWord: z.string(),
  fromColor: z.string().default("oklch(0.78 0.02 80)"),
  toColor: z.string().default("#f59e0b"),
  durationFrames: z.number().int().min(8).max(60).default(24),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type InlineHighlightProps = z.infer<typeof inlineHighlightSchema> & {
  /** Optional: frame at which the color transition begins. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, weighty.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Material standard. Brisker, responsive.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
const BRAND_SECONDARY_HIGHLIGHT = "#c9b99a"; // --vantage-secondary-highlight
// Resolve oklch() fromColor fallback — perceptual warm neutral
const OKLCH_WARM_NEUTRAL_FALLBACK = "#c9b99a"; // oklch(0.78 0.02 80) sRGB approx

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * InlineHighlight — animates the color of a single word within a sentence
 * from `fromColor` to `toColor` over `durationFrames`.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Body text: --vantage-warm-white (#e8e0d0) — never pure white on near-black
 * - Highlighted word: transitions to --vantage-accent (#f59e0b) warm amber
 * - Font: Georgia (body size < 56px per BRAND.md Rule 2)
 * - Easing: literary or snappy from BRAND.md motion vocabulary
 *
 * Remotion primitives: AbsoluteFill + useCurrentFrame + interpolate + interpolateColors.
 * No @remotion/transitions TransitionSeries API used.
 */
export function InlineHighlight({
  text,
  highlightWord,
  fromColor = "oklch(0.78 0.02 80)",
  toColor = "#f59e0b",
  durationFrames = 24,
  easing = "literary",
  startFrame = 0,
}: InlineHighlightProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  // Resolve oklch() color values to sRGB fallbacks for interpolateColors
  const resolvedFromColor = fromColor.startsWith("oklch(")
    ? OKLCH_WARM_NEUTRAL_FALLBACK
    : fromColor;
  const resolvedToColor = toColor.startsWith("oklch(")
    ? BRAND_SECONDARY_HIGHLIGHT
    : toColor;

  const localFrame = Math.max(0, frame - startFrame);

  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const highlightColor = interpolateColors(
    progress,
    [0, 1],
    [resolvedFromColor, resolvedToColor],
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
            color: highlightColor,
            fontWeight: 700,
            transition: "none",
          }}
        >
          {displayWord}
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
  name: "inline-highlight",
  type: "registry:component" as const,
  description:
    "Animates a single word's color within a sentence from neutral to warm amber accent. Literary or snappy easing, BRAND.md aligned.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/inline-highlight/inline-highlight.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/inline-highlight.tsx",
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

export default InlineHighlight;
