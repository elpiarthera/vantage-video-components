"use client";

import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const fadeBlurSchema = z.object({
  direction: z.enum(["in", "out"]).default("in"),
  durationFrames: z.number().int().min(8).max(60).default(20),
  blurMax: z.number().min(0).max(30).default(12),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type FadeBlurProps = z.infer<typeof fadeBlurSchema> & {
  /** Content to fade/blur in or out. */
  children?: ReactNode;
  /** Frame at which the transition starts. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, weighty. For narrative scene changes.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Material standard. Brisker, responsive. For UI chrome only.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Default demo content
// ---------------------------------------------------------------------------

function DefaultContent() {
  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
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
        Fade Blur
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
        A soft editorial entrance through opacity and blur.
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * FadeBlur — Remotion-primitive-based fade + blur transition.
 *
 * Implements with: AbsoluteFill + useCurrentFrame + interpolate + Sequence.
 * Does NOT use @remotion/transitions TransitionSeries API.
 *
 * Brand alignment (BRAND.md):
 * - literary-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94) — narrative scenes
 * - snappy-ease: cubic-bezier(0.4, 0, 0.2, 1) — UI chrome only
 * - Colors: OKLCH tokens from --vantage-bg palette
 */
export function FadeBlur({
  direction = "in",
  durationFrames = 20,
  blurMax = 12,
  easing = "literary",
  children,
  startFrame = 0,
}: FadeBlurProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const localFrame = frame - startFrame;
  const clampedFrame = Math.max(0, Math.min(localFrame, durationFrames));

  // For fade-in: opacity 0→1, blur blurMax→0
  // For fade-out: opacity 1→0, blur 0→blurMax
  const [opacityFrom, opacityTo] = direction === "in" ? [0, 1] : [1, 0];
  const [blurFrom, blurTo] = direction === "in" ? [blurMax, 0] : [0, blurMax];

  const opacity = interpolate(
    clampedFrame,
    [0, durationFrames],
    [opacityFrom, opacityTo],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: selectedEasing,
    },
  );

  const blurPx = interpolate(
    clampedFrame,
    [0, durationFrames],
    [blurFrom, blurTo],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: selectedEasing,
    },
  );

  const content = children ?? <DefaultContent />;

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: `blur(${blurPx}px)`,
        willChange: "opacity, filter",
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
  name: "fade-blur",
  type: "registry:component" as const,
  description:
    "Remotion-primitive-based fade + blur transition. Opacity 0→1 with blur blurMax→0 (or reverse for fade-out). Literary or snappy easing from BRAND.md motion vocabulary.",
  dependencies: ["remotion"],
  files: [
    {
      path: "src/registry/components/transitions/fade-blur/fade-blur.tsx",
      type: "registry:component" as const,
      target: "remotion/transitions/fade-blur.tsx",
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

export default FadeBlur;
