"use client";

import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const slideRevealSchema = z.object({
  direction: z.enum(["left", "right", "up", "down"]).default("left"),
  durationFrames: z.number().int().min(8).max(60).default(24),
  distance: z.number().min(0).max(1).default(1),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type SlideRevealProps = z.infer<typeof slideRevealSchema> & {
  /** Content to slide into view. */
  children?: ReactNode;
  /** Frame at which the transition starts. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. For narrative scene changes.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Brisker. For UI chrome only.
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
        Slide Reveal
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
        Content enters from off-screen along the chosen axis.
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Helper — compute translate from direction + distance progress
// ---------------------------------------------------------------------------

function resolveTranslate(
  direction: SlideRevealProps["direction"],
  progress: number,
  distance: number,
): string {
  // progress 0 = off-screen position, progress 1 = final position (0)
  const offset = (1 - progress) * distance * 100;

  switch (direction) {
    case "left":
      return `translateX(${-offset}%)`;
    case "right":
      return `translateX(${offset}%)`;
    case "up":
      return `translateY(${-offset}%)`;
    case "down":
      return `translateY(${offset}%)`;
    default:
      return `translateX(${-offset}%)`;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * SlideReveal — Remotion-primitive-based slide transition.
 *
 * Implements with: AbsoluteFill + useCurrentFrame + interpolate.
 * Does NOT use @remotion/transitions TransitionSeries API.
 *
 * Translates child from off-screen at `distance × 100%` to 0 along chosen axis.
 * Combine with FadeBlur for a refined entrance per BRAND.md slide doctrine:
 * "Combine with `fade` (opacity 0→1 simultaneously) for a refined entrance."
 *
 * Brand alignment:
 * - Slide reserved for content elements, never for full-frame backdrops
 * - Never slide Cormorant Display H1 text (per BRAND.md slide doctrine)
 * - literary-ease for narrative; snappy for UI chrome
 */
export function SlideReveal({
  direction = "left",
  durationFrames = 24,
  distance = 1,
  easing = "literary",
  children,
  startFrame = 0,
}: SlideRevealProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const localFrame = frame - startFrame;

  // Slide progress: 0 (off-screen) → 1 (in place)
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // Combine with subtle opacity fade per BRAND.md "Combine with fade" guidance
  const opacity = interpolate(
    localFrame,
    [0, Math.ceil(durationFrames * 0.5)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: selectedEasing,
    },
  );

  const transform = resolveTranslate(direction, progress, distance);
  const content = children ?? <DefaultContent />;

  return (
    <AbsoluteFill
      style={{
        transform,
        opacity,
        willChange: "transform, opacity",
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
  name: "slide-reveal",
  type: "registry:component" as const,
  description:
    "Remotion-primitive-based slide transition. Translates child from off-screen at distance×100% to 0 along chosen axis (left/right/up/down). Literary or snappy easing from BRAND.md.",
  dependencies: ["remotion"],
  files: [
    {
      path: "src/registry/components/transitions/slide-reveal/slide-reveal.tsx",
      type: "registry:component" as const,
      target: "remotion/transitions/slide-reveal.tsx",
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

export default SlideReveal;
