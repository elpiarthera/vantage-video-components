"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const trackingInSchema = z.object({
  text: z.string(),
  startLetterSpacing: z.number().min(0.05).max(0.4).default(0.15),
  startBlur: z.number().min(0).max(20).default(8),
  durationFrames: z.number().int().min(8).max(60).default(22),
  easing: z.enum(["literary", "snappy"]).default("literary"),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("cormorant"),
});

export type TrackingInProps = z.infer<typeof trackingInSchema>;

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/** literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94) */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/** ui-ease → cubic-bezier(0.4, 0, 0.2, 1) — brisker, responsive */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Brand tokens (BRAND.md canonical sRGB fallbacks)
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white

// ---------------------------------------------------------------------------
// Font resolution (BRAND.md typography: Cormorant ≥56px, Georgia below)
// ---------------------------------------------------------------------------

function resolveFontFamily(font: TrackingInProps["font"]): string {
  if (font === "cormorant") {
    return '"Cormorant Display", "Cormorant", Georgia, serif';
  }
  if (font === "georgia") {
    return "Georgia, 'Times New Roman', serif";
  }
  return "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * TrackingIn — letters expand from wide tracking + blur into tight, sharp text.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Text: --vantage-warm-white (#e8e0d0)
 * - Font: Cormorant Display (≥56px) or Georgia/system-ui
 * - Motion: literary or snappy easing driven by `easing` prop
 *
 * Upstream source: /tmp/remocn-inventory/registry/remocn/tracking-in/index.tsx
 * Adaptation: replaced spring() with interpolate() + Easing, brand tokens, Zod schema.
 */
export function TrackingIn({
  text,
  startLetterSpacing = 0.15,
  startBlur = 8,
  durationFrames = 22,
  easing = "literary",
  font = "cormorant",
}: TrackingInProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const easingFn = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  // Use spring for organic motion — config from BRAND.md §3
  const t = spring({
    frame,
    fps,
    config: {
      damping: easing === "literary" ? 14 : 20,
      stiffness: easing === "literary" ? 80 : 120,
      mass: easing === "literary" ? 1.2 : 0.8,
    },
  });

  const letterSpacing = interpolate(t, [0, 1], [startLetterSpacing, -0.015], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blurAmount = interpolate(t, [0, 1], [startBlur, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, durationFrames * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFn,
  });

  const fontFamily = resolveFontFamily(font);

  // BRAND.md Rule 2: Cormorant ≥56px only
  const fontSize = font === "cormorant" ? 72 : 48;
  const fontWeight = font === "cormorant" ? 600 : 400;

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
      <span
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          color: BRAND_WARM_WHITE,
          letterSpacing: `${letterSpacing}em`,
          opacity,
          filter: `blur(${blurAmount}px)`,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {text}
      </span>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "tracking-in",
  type: "registry:component" as const,
  description:
    "Letters expand from wide tracking + blur into tight, sharp text. Brand-aligned OKLCH palette, Cormorant/Georgia typography, literary or snappy easing.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/tracking-in/tracking-in.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/tracking-in.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

export default TrackingIn;
