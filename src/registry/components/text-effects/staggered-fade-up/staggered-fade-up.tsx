"use client";

import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const staggeredFadeUpSchema = z.object({
  words: z.array(z.string()),
  staggerFrames: z.number().int().min(2).max(30).default(8),
  riseDistance: z.number().int().min(8).max(80).default(24),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type StaggeredFadeUpProps = z.infer<typeof staggeredFadeUpSchema>;

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, weighty. For narrative text entrances.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Material standard. Brisker. For UI chrome.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white

// ---------------------------------------------------------------------------
// Per-word animation constants
// ---------------------------------------------------------------------------

// Fade duration per word (12 frames = 400ms at 30fps = BRAND.md "medium")
const WORD_FADE_DURATION = 12;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * StaggeredFadeUp — reveals an array of words one by one, each fading in
 * while rising `riseDistance` pixels from below. Words start `staggerFrames`
 * apart.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Text: --vantage-warm-white (#e8e0d0)
 * - Font: Georgia (body text < 56px, BRAND.md Rule 2)
 * - Easing: literary or snappy from BRAND.md motion vocabulary
 * - Motion: slide = body text only, never full-frame (BRAND.md doctrine)
 *
 * Remotion primitives: AbsoluteFill + useCurrentFrame + interpolate.
 * No @remotion/transitions TransitionSeries API used.
 */
export function StaggeredFadeUp({
  words,
  staggerFrames = 8,
  riseDistance = 24,
  easing = "literary",
}: StaggeredFadeUpProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  return (
    <AbsoluteFill
      style={{
        background: BRAND_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
        flexWrap: "wrap",
        gap: "0.3em",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.3em",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 48,
          fontWeight: 400,
          color: BRAND_WARM_WHITE,
          letterSpacing: 0,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {words.map((word, idx) => {
          const wordStart = idx * staggerFrames;
          const wordEnd = wordStart + WORD_FADE_DURATION;
          const localFrame = frame - wordStart;

          const opacity = interpolate(
            localFrame,
            [0, WORD_FADE_DURATION],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: selectedEasing,
            },
          );

          const translateY = interpolate(
            localFrame,
            [0, wordEnd - wordStart],
            [riseDistance, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: selectedEasing,
            },
          );

          return (
            <span
              key={word + String(idx)}
              style={{
                display: "inline-block",
                opacity,
                transform: `translateY(${translateY}px)`,
                willChange: "opacity, transform",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "staggered-fade-up",
  type: "registry:component" as const,
  description:
    "Reveals words sequentially, each fading in while rising from below. Stagger delay and rise distance are configurable. Literary or snappy easing, BRAND.md aligned.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/staggered-fade-up/staggered-fade-up.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/staggered-fade-up.tsx",
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

export default StaggeredFadeUp;
