"use client";

import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const shimmerSweepSchema = z.object({
  text: z.string(),
  baseColor: z.string().default("oklch(0.62 0.01 80)"),
  sweepColor: z.string().default("#f59e0b"),
  sweepFrames: z.number().int().min(20).max(90).default(45),
  easing: z.enum(["literary", "snappy"]).default("snappy"),
});

export type ShimmerSweepProps = z.infer<typeof shimmerSweepSchema>;

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Default for shimmer — chrome-like motion.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_ACCENT = "#f59e0b"; // --vantage-accent
const BRAND_MUTED = "#9ca3af"; // --vantage-muted (oklch(0.62 0.01 80) approx)

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * ShimmerSweep — a luminous sweep travels across the text, transitioning from
 * `baseColor` through `sweepColor` and back, simulating a specular highlight
 * passing across metallic type.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Base text: --vantage-muted (#9ca3af) — subdued prose
 * - Sweep highlight: --vantage-accent (#f59e0b) warm amber
 * - Font: Georgia (body text per BRAND.md Rule 2 — shimmer is best on mid-size)
 * - Easing: snappy (default) for chrome-like specular motion
 *
 * Technique: two overlapping text spans — base and a gradient-clipped overlay.
 * backgroundPosition drives the sweep without animating width/height.
 *
 * Remotion primitives: AbsoluteFill + useCurrentFrame + interpolate.
 * No @remotion/transitions TransitionSeries API used.
 */
export function ShimmerSweep({
  text,
  baseColor = "oklch(0.62 0.01 80)",
  sweepColor = "#f59e0b",
  sweepFrames = 45,
  easing = "snappy",
}: ShimmerSweepProps) {
  const frame = useCurrentFrame();
  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  // Resolve oklch() colors to sRGB fallbacks
  const resolvedBaseColor = baseColor.startsWith("oklch(")
    ? BRAND_MUTED
    : baseColor;
  const resolvedSweepColor = sweepColor.startsWith("oklch(")
    ? BRAND_ACCENT
    : sweepColor;

  // Sweep position: backgroundPosition moves from 200% to -100% (right-to-left sweep)
  // Using transform-based alternative: gradient position via backgroundPosition %
  const position = interpolate(frame, [0, sweepFrames], [200, -100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const textStyle: React.CSSProperties = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 64,
    fontWeight: 700,
    letterSpacing: "-0.015em",
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center" as const,
  };

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
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Base layer: text in muted base color */}
        <span style={{ ...textStyle, color: resolvedBaseColor }}>{text}</span>

        {/* Sweep layer: gradient-clipped text over the base */}
        <span
          aria-hidden="true"
          style={{
            ...textStyle,
            position: "absolute",
            inset: 0,
            color: "transparent",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            backgroundImage: `linear-gradient(
              110deg,
              transparent 25%,
              ${resolvedSweepColor} 50%,
              transparent 75%
            )`,
            backgroundSize: "200% 100%",
            backgroundPosition: `${position}% 50%`,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "shimmer-sweep",
  type: "registry:component" as const,
  description:
    "A luminous amber sweep travels across text simulating a specular highlight on metallic type. Snappy easing default, BRAND.md aligned.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/shimmer-sweep/shimmer-sweep.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/shimmer-sweep.tsx",
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

export default ShimmerSweep;
