"use client";

import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const fadeBlurSchema = z.object({
  direction: z.enum(["in", "out", "cross"]).default("cross"),
  durationFrames: z.number().int().min(8).max(60).default(20),
  accentColor: z.string().default("oklch(0.74 0.16 60)"),
  easing: z.enum(["literary", "snappy"]).default("literary"),
  blurRadius: z.number().min(0).max(40).default(12),
});

export type FadeBlurProps = z.infer<typeof fadeBlurSchema> & {
  /** The outgoing scene (before the transition). */
  from?: ReactNode;
  /** The incoming scene (after the transition). */
  to?: ReactNode;
  /** Frame at which the transition starts. Defaults to midpoint minus half duration. */
  transitionStart?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Colour tokens (BRAND.md canonical values)
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a";
const BRAND_SURFACE = "#141414";
const BRAND_PROSE = "#e5e7eb";
const BRAND_ACCENT_FALLBACK = "#f59e0b";

// ---------------------------------------------------------------------------
// Default demo panels
// ---------------------------------------------------------------------------

function DefaultFromPanel() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 56,
          fontWeight: 700,
          color: BRAND_PROSE,
          letterSpacing: "-0.015em",
        }}
      >
        Scene A
      </div>
    </AbsoluteFill>
  );
}

function DefaultToPanel() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND_SURFACE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 56,
          fontWeight: 700,
          color: BRAND_PROSE,
          letterSpacing: "-0.015em",
        }}
      >
        Scene B
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FadeBlur({
  from,
  to,
  direction = "cross",
  durationFrames = 20,
  accentColor = "oklch(0.74 0.16 60)",
  easing = "literary",
  blurRadius = 12,
  transitionStart,
}: FadeBlurProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const start =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.5) - Math.floor(durationFrames * 0.5);

  const end = start + durationFrames;

  // Progress 0 → 1 over the transition window
  const progress = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // Outgoing: fades out + blurs
  const fromOpacity =
    direction === "in" ? 1 : interpolate(progress, [0, 1], [1, 0]);
  const fromBlur =
    direction === "in" ? 0 : interpolate(progress, [0, 1], [0, blurRadius]);

  // Incoming: fades in + unblurs
  const toOpacity =
    direction === "out" ? 0 : interpolate(progress, [0, 1], [0, 1]);
  const toBlur =
    direction === "out"
      ? blurRadius
      : interpolate(progress, [0, 1], [blurRadius, 0]);

  const fromScene = from ?? <DefaultFromPanel />;
  const toScene = to ?? <DefaultToPanel />;

  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT_FALLBACK
    : accentColor;

  // Accent flash at transition midpoint
  const flashOpacity = interpolate(
    frame,
    [
      start + Math.floor(durationFrames * 0.4),
      start + Math.floor(durationFrames * 0.5),
      start + Math.floor(durationFrames * 0.6),
    ],
    [0, 0.18, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>
      {/* Outgoing scene */}
      <AbsoluteFill
        style={{
          opacity: fromOpacity,
          filter: `blur(${fromBlur}px)`,
          willChange: "opacity, filter",
        }}
      >
        {fromScene}
      </AbsoluteFill>

      {/* Incoming scene */}
      <AbsoluteFill
        style={{
          opacity: toOpacity,
          filter: `blur(${toBlur}px)`,
          willChange: "opacity, filter",
        }}
      >
        {toScene}
      </AbsoluteFill>

      {/* Subtle accent bloom at the crossover point */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${resolvedAccent}55, transparent 60%)`,
          opacity: flashOpacity,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "fade-blur",
  type: "registry:component" as const,
  description:
    "Cross-dissolve transition where scenes fade through a shared blur peak, producing a filmic soft-cut with an optional amber bloom.",
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

export default FadeBlur;
