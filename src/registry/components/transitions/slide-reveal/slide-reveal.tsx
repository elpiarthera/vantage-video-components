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

export const slideRevealSchema = z.object({
  direction: z.enum(["left", "right", "up", "down"]).default("left"),
  durationFrames: z.number().int().min(8).max(60).default(24),
  accentColor: z.string().default("oklch(0.74 0.16 60)"),
  easing: z.enum(["literary", "snappy"]).default("snappy"),
  overlap: z.number().min(0).max(1).default(0.3),
});

export type SlideRevealProps = z.infer<typeof slideRevealSchema> & {
  /** The outgoing scene. */
  from?: ReactNode;
  /** The incoming scene. */
  to?: ReactNode;
  /** Frame at which the slide starts. Defaults to 40% of composition duration. */
  transitionStart?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Colour tokens
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
// Direction → axis helper
// ---------------------------------------------------------------------------

function resolveSlide(
  direction: SlideRevealProps["direction"],
  outProgress: number,
  inProgress: number,
): { fromTransform: string; toTransform: string } {
  if (direction === "left") {
    return {
      fromTransform: `translateX(${outProgress * -100}%)`,
      toTransform: `translateX(${(1 - inProgress) * 100}%)`,
    };
  }
  if (direction === "right") {
    return {
      fromTransform: `translateX(${outProgress * 100}%)`,
      toTransform: `translateX(${(1 - inProgress) * -100}%)`,
    };
  }
  if (direction === "up") {
    return {
      fromTransform: `translateY(${outProgress * -100}%)`,
      toTransform: `translateY(${(1 - inProgress) * 100}%)`,
    };
  }
  // down
  return {
    fromTransform: `translateY(${outProgress * 100}%)`,
    toTransform: `translateY(${(1 - inProgress) * -100}%)`,
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SlideReveal({
  from,
  to,
  direction = "left",
  durationFrames = 24,
  accentColor = "oklch(0.74 0.16 60)",
  easing = "snappy",
  overlap = 0.3,
  transitionStart,
}: SlideRevealProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const start =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.4);

  const end = start + durationFrames;

  // Outgoing scene slides fully out before end
  const outEnd = start + Math.floor(durationFrames * (1 - overlap));
  const outProgress = interpolate(frame, [start, outEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // Incoming scene slides in with overlap
  const inStart = start + Math.floor(durationFrames * overlap);
  const inProgress = interpolate(frame, [inStart, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const { fromTransform, toTransform } = resolveSlide(
    direction,
    outProgress,
    inProgress,
  );

  const fromScene = from ?? <DefaultFromPanel />;
  const toScene = to ?? <DefaultToPanel />;

  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT_FALLBACK
    : accentColor;

  // Edge streak accent — a thin line that races across at peak transition velocity
  const streakOpacity = interpolate(
    frame,
    [
      start + Math.floor(durationFrames * 0.3),
      start + Math.floor(durationFrames * 0.5),
      start + Math.floor(durationFrames * 0.7),
    ],
    [0, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const isVertical = direction === "up" || direction === "down";

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>
      {/* Outgoing scene */}
      <AbsoluteFill
        style={{
          transform: fromTransform,
          willChange: "transform",
        }}
      >
        {fromScene}
      </AbsoluteFill>

      {/* Incoming scene */}
      <AbsoluteFill
        style={{
          transform: toTransform,
          willChange: "transform",
        }}
      >
        {toScene}
      </AbsoluteFill>

      {/* Accent streak at the seam */}
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? { left: 0, right: 0, height: 2, top: "50%" }
            : { top: 0, bottom: 0, width: 2, left: "50%" }),
          background: resolvedAccent,
          opacity: streakOpacity,
          pointerEvents: "none",
          zIndex: 10,
          boxShadow: `0 0 12px 3px ${resolvedAccent}88`,
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "slide-reveal",
  type: "registry:component" as const,
  description:
    "Directional slide transition where the outgoing scene pushes off while the incoming scene sweeps in, with a fleeting amber streak at the seam.",
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

export default SlideReveal;
