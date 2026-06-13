"use client";

import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const zoomPulseSchema = z.object({
  scaleFrom: z.number().min(0.5).max(2).default(0.92),
  scaleTo: z.number().min(0.5).max(2).default(1.06),
  pulseFrames: z.number().int().min(8).max(60).default(30),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type ZoomPulseProps = z.infer<typeof zoomPulseSchema> & {
  /** Content to zoom pulse. */
  children?: ReactNode;
  /** Frame at which the pulse starts. Defaults to 0. */
  startFrame?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, for dramatic reveals.
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
        Zoom Pulse
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
        Smooth scale interpolation with overshoot.
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * ZoomPulse — Remotion-primitive-based scale pulse transition.
 *
 * Implements with: AbsoluteFill + useCurrentFrame + interpolate.
 * Does NOT use @remotion/transitions TransitionSeries API.
 *
 * Produces a smooth scale interpolation from scaleFrom → scaleTo with an
 * overshoot at the midpoint, then eases to final scale. This creates the
 * organic "breath" effect described in BRAND.md zoom doctrine.
 *
 * Brand alignment (BRAND.md):
 * - Zoom never exceeds ±8% from 1.0 (1.0 to 1.08 max for Ken Burns)
 * - scaleFrom default 0.92 / scaleTo default 1.06 satisfies this constraint
 * - Never zoom text overlays (reads as presentation-software)
 * - literary-ease for narrative; snappy for UI chrome
 */
export function ZoomPulse({
  scaleFrom = 0.92,
  scaleTo = 1.06,
  pulseFrames = 30,
  easing = "literary",
  children,
  startFrame = 0,
}: ZoomPulseProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const localFrame = frame - startFrame;

  // Overshoot pattern: scaleFrom → overshoot peak → scaleTo
  // Overshoot at 60% of pulseFrames, decays to scaleTo by end
  const overshoot = scaleFrom + (scaleTo - scaleFrom) * 1.15;
  const midPoint = Math.ceil(pulseFrames * 0.6);

  const scale = interpolate(
    localFrame,
    [0, midPoint, pulseFrames],
    [scaleFrom, overshoot, scaleTo],
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
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        willChange: "transform",
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
  name: "zoom-pulse",
  type: "registry:component" as const,
  description:
    "Remotion-primitive-based scale pulse transition. Smooth scale interpolation from scaleFrom to scaleTo with a natural overshoot. Literary or snappy easing from BRAND.md.",
  dependencies: ["remotion"],
  files: [
    {
      path: "src/registry/components/transitions/zoom-pulse/zoom-pulse.tsx",
      type: "registry:component" as const,
      target: "remotion/transitions/zoom-pulse.tsx",
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

export default ZoomPulse;
