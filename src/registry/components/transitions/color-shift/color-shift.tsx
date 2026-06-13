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

export const colorShiftSchema = z.object({
  direction: z.enum(["warm", "cool", "neutral"]).default("warm"),
  durationFrames: z.number().int().min(8).max(60).default(24),
  accentColor: z.string().default("oklch(0.74 0.16 60)"),
  easing: z.enum(["literary", "snappy"]).default("literary"),
  overlayOpacityPeak: z.number().min(0).max(1).default(0.45),
});

export type ColorShiftProps = z.infer<typeof colorShiftSchema> & {
  /** The outgoing scene. */
  from?: ReactNode;
  /** The incoming scene. */
  to?: ReactNode;
  /** Frame at which the color shift starts. Defaults to 40% of composition duration. */
  transitionStart?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Colour tokens & shift palettes
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a";
const BRAND_SURFACE = "#141414";
const BRAND_PROSE = "#e5e7eb";
const BRAND_ACCENT_FALLBACK = "#f59e0b";

// Shift overlay colors per direction
const SHIFT_COLORS = {
  warm: "#f59e0b", // amber bloom — BRAND.md canonical accent
  cool: "#3b82f6", // brief blue wash for contrast-scene cuts
  neutral: "#e5e7eb", // prose-white flash for editorial whiteout
} as const;

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

export function ColorShift({
  from,
  to,
  direction = "warm",
  durationFrames = 24,
  accentColor = "oklch(0.74 0.16 60)",
  easing = "literary",
  overlayOpacityPeak = 0.45,
  transitionStart,
}: ColorShiftProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  const start =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.4);

  const peak = start + Math.floor(durationFrames * 0.5);
  const end = start + durationFrames;

  // Cross-dissolve progress (outgoing fades out, incoming fades in)
  const fromOpacity = interpolate(frame, [start, peak], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const toOpacity = interpolate(frame, [peak, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  // Color overlay arcs up to peak then recedes
  const overlayOpacity = interpolate(
    frame,
    [start, peak, end],
    [0, overlayOpacityPeak, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: selectedEasing,
    },
  );

  // Determine overlay color
  const rawShiftColor = SHIFT_COLORS[direction];
  const overlayColor =
    direction === "warm" && accentColor.startsWith("oklch(")
      ? BRAND_ACCENT_FALLBACK
      : direction === "warm"
        ? accentColor
        : rawShiftColor;

  const fromScene = from ?? <DefaultFromPanel />;
  const toScene = to ?? <DefaultToPanel />;

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>
      {/* Outgoing scene */}
      <AbsoluteFill
        style={{
          opacity: fromOpacity,
          willChange: "opacity",
        }}
      >
        {fromScene}
      </AbsoluteFill>

      {/* Incoming scene */}
      <AbsoluteFill
        style={{
          opacity: toOpacity,
          willChange: "opacity",
        }}
      >
        {toScene}
      </AbsoluteFill>

      {/* Color shift overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
          pointerEvents: "none",
          zIndex: 10,
          mixBlendMode: direction === "neutral" ? "screen" : "normal",
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "color-shift",
  type: "registry:component" as const,
  description:
    "Cross-dissolve transition that washes through a brand-color overlay at the midpoint, signalling a tonal shift between scenes.",
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

export default ColorShift;
