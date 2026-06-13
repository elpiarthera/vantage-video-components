"use client";

import type { ReactNode } from "react";
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

export const colorShiftSchema = z.object({
  fromColor: z.string().default("#0a0a0a"),
  toColor: z.string().default("#f59e0b"),
  durationFrames: z.number().int().min(8).max(60).default(30),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type ColorShiftProps = z.infer<typeof colorShiftSchema> & {
  /** Optional content to render over the color-shift background. */
  children?: ReactNode;
  /** Frame at which the transition starts. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. For scene mood transitions.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Brisker. For UI chrome.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Default demo content
// ---------------------------------------------------------------------------

function DefaultContent() {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.015em",
          textAlign: "center",
        }}
      >
        Color Shift
      </div>
      <div
        style={{
          width: 48,
          height: 4,
          backgroundColor: "#f59e0b",
        }}
      />
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 24,
          fontWeight: 400,
          color: "#e8e0d0",
          letterSpacing: 0,
          lineHeight: 1.6,
          textAlign: "center",
          maxWidth: 560,
        }}
      >
        Background color interpolated between two OKLCH-anchored brand tones.
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * ColorShift — Remotion-primitive-based background-color interpolation.
 *
 * Implements with: AbsoluteFill + useCurrentFrame + interpolate + interpolateColors.
 * Does NOT use @remotion/transitions TransitionSeries API.
 *
 * Uses Remotion's `interpolateColors` for perceptually smooth color transitions.
 * Default colors map to BRAND.md tokens:
 * - fromColor: #0a0a0a (--vantage-bg, oklch(0.16 0 0))
 * - toColor:   #f59e0b (--vantage-accent, oklch(0.74 0.16 60))
 *
 * Brand alignment (BRAND.md color-shift doctrine):
 * - Use for scene mood transitions within a continuous backdrop
 * - Accompanies content that is changing, does not replace it
 * - One color-shift overlay per scene maximum
 * - Total reels: max 2-3 light-leaks/color-shifts combined
 * - literary-ease for narrative; snappy for UI chrome
 */
export function ColorShift({
  fromColor = "#0a0a0a",
  toColor = "#f59e0b",
  durationFrames = 30,
  easing = "literary",
  children,
  startFrame = 0,
}: ColorShiftProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const localFrame = frame - startFrame;

  // Progress 0→1 with easing applied
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // interpolateColors produces a perceptually smooth hex color transition
  // This is the recommended Remotion approach for color interpolation
  const backgroundColor = interpolateColors(
    progress,
    [0, 1],
    [fromColor, toColor],
  );

  const content = children ?? <DefaultContent />;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        willChange: "background-color",
      }}
    >
      {content}
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config object (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "color-shift",
  type: "registry:component" as const,
  description:
    "Remotion-primitive-based background-color interpolation transition. Uses interpolateColors for perceptual smoothness between any two BRAND.md OKLCH-anchored color tokens. Literary or snappy easing.",
  dependencies: ["remotion"],
  files: [
    {
      path: "src/registry/components/transitions/color-shift/color-shift.tsx",
      type: "registry:component" as const,
      target: "remotion/transitions/color-shift.tsx",
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

export default ColorShift;
