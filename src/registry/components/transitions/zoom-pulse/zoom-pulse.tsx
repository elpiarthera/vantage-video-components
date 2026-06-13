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

export const zoomPulseSchema = z.object({
  direction: z.enum(["in", "out", "punch"]).default("punch"),
  durationFrames: z.number().int().min(8).max(60).default(18),
  accentColor: z.string().default("oklch(0.74 0.16 60)"),
  easing: z.enum(["literary", "snappy"]).default("snappy"),
  scalePeak: z.number().min(1.01).max(1.5).default(1.08),
});

export type ZoomPulseProps = z.infer<typeof zoomPulseSchema> & {
  /** The outgoing scene. */
  from?: ReactNode;
  /** The incoming scene. */
  to?: ReactNode;
  /** Frame at which the zoom pulse starts. Defaults to 40% of composition duration. */
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
// Main component
// ---------------------------------------------------------------------------

export function ZoomPulse({
  from,
  to,
  direction = "punch",
  durationFrames = 18,
  accentColor = "oklch(0.74 0.16 60)",
  easing = "snappy",
  scalePeak = 1.08,
  transitionStart,
}: ZoomPulseProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const start =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.4);

  const cutFrame = start + Math.floor(durationFrames * 0.5);
  const end = start + durationFrames;

  // Scale pulse: ramps up to peak at cutFrame, then back to 1
  const fromScale = interpolate(frame, [start, cutFrame], [1, scalePeak], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const toScale = interpolate(frame, [cutFrame, end], [scalePeak, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // "in" direction: only incoming zooms from large to normal
  // "out" direction: only outgoing zooms from normal to large
  // "punch": both zoom through the peak simultaneously

  const isAfterCut = frame >= cutFrame;

  const fromScene = from ?? <DefaultFromPanel />;
  const toScene = to ?? <DefaultToPanel />;

  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT_FALLBACK
    : accentColor;

  const flashOpacity = interpolate(
    frame,
    [cutFrame - 2, cutFrame, cutFrame + 2],
    [0, 0.22, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>
      {/* Outgoing */}
      {(direction === "out" || direction === "punch") && !isAfterCut && (
        <AbsoluteFill
          style={{
            transform: `scale(${fromScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {fromScene}
        </AbsoluteFill>
      )}
      {direction === "in" && !isAfterCut && (
        <AbsoluteFill>{fromScene}</AbsoluteFill>
      )}

      {/* Incoming */}
      {(direction === "in" || direction === "punch") && isAfterCut && (
        <AbsoluteFill
          style={{
            transform: `scale(${toScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {toScene}
        </AbsoluteFill>
      )}
      {direction === "out" && isAfterCut && (
        <AbsoluteFill>{toScene}</AbsoluteFill>
      )}

      {/* Accent flash at peak scale */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${resolvedAccent}44, transparent 50%)`,
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
  name: "zoom-pulse",
  type: "registry:component" as const,
  description:
    "Scale-punch transition that pushes scenes through a shared zoom peak before snapping to the cut, giving editorial impact to a simple cut.",
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

export default ZoomPulse;
