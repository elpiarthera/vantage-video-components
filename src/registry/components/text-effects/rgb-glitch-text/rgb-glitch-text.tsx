"use client";

import type React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const rgbGlitchTextSchema = z.object({
  text: z.string(),
  glitchFrames: z.number().int().min(2).max(30).default(10),
  offsetPx: z.number().min(0).max(12).default(4),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("cormorant"),
});

export type RGBGlitchTextProps = z.infer<typeof rgbGlitchTextSchema>;

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
const BRAND_HEADING = "#ffffff"; // --vantage-heading (H1 only)

// Glitch channel colors — these are the additive RGB primaries for the
// chromatic aberration split (mix-blend-mode: multiply on dark bg inverts to screen)
const GLITCH_R = "#ff0040";
const GLITCH_G = "#00ff80";
const GLITCH_B = "#0080ff";

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------

function resolveFontFamily(font: RGBGlitchTextProps["font"]): string {
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
 * RGBGlitchText — displays text normally then triggers a brief RGB chromatic
 * aberration glitch effect by offsetting red, green, and blue channel copies.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Base text: --vantage-heading (#ffffff) — large H1 register
 * - Glitch duration: `glitchFrames` frames starting at glitch trigger
 * - Font: Cormorant Display default (large title register)
 * - No accent overuse — glitch effect itself provides the visual moment
 *
 * Glitch triggers once: frames 0..glitchFrames. After, text is stable.
 * This avoids infinite loops that read as broken rather than stylistic.
 *
 * Upstream source: /tmp/remocn-inventory/registry/remocn/rgb-glitch-text/index.tsx
 * Adaptation: brand dark canvas, Zod schema, deterministic seed from text,
 * one-shot glitch (not looping), brand warm-white base with heading white.
 */
export function RGBGlitchText({
  text,
  glitchFrames = 10,
  offsetPx = 4,
  font = "cormorant",
}: RGBGlitchTextProps) {
  const frame = useCurrentFrame();

  // Glitch fires once at the start (frames 0..glitchFrames)
  const isGlitching = frame < glitchFrames;

  const seedBase = text.slice(0, 6);

  const offset = (axis: string, scale: number) =>
    isGlitching ? (random(`${seedBase}-${axis}-${frame}`) * 2 - 1) * scale : 0;

  const rX = offset("r-x", offsetPx);
  const rY = offset("r-y", offsetPx * 0.4);
  const gX = offset("g-x", offsetPx);
  const gY = offset("g-y", offsetPx * 0.4);
  const bX = offset("b-x", offsetPx);
  const bY = offset("b-y", offsetPx * 0.4);

  const copyOpacity = isGlitching ? 1 : 0;

  const fontFamily = resolveFontFamily(font);
  // BRAND.md Rule 2: Cormorant ≥56px only
  const fontSize = font === "cormorant" ? 80 : 56;
  const fontWeight = font === "cormorant" ? 700 : 600;

  const baseLayerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing: font === "cormorant" ? "-0.02em" : "-0.015em",
    whiteSpace: "pre",
    mixBlendMode: "screen",
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
        {/* Base layer — always visible */}
        <span
          style={{
            position: "relative",
            fontFamily,
            fontSize,
            fontWeight,
            color: isGlitching ? BRAND_HEADING : BRAND_WARM_WHITE,
            letterSpacing: font === "cormorant" ? "-0.02em" : "-0.015em",
            whiteSpace: "pre",
          }}
        >
          {text}
        </span>

        {/* Red channel */}
        <span
          aria-hidden="true"
          style={{
            ...baseLayerStyle,
            color: GLITCH_R,
            opacity: copyOpacity,
            transform: `translateX(${rX}px) translateY(${rY}px)`,
          }}
        >
          {text}
        </span>

        {/* Green channel */}
        <span
          aria-hidden="true"
          style={{
            ...baseLayerStyle,
            color: GLITCH_G,
            opacity: copyOpacity,
            transform: `translateX(${gX}px) translateY(${gY}px)`,
          }}
        >
          {text}
        </span>

        {/* Blue channel */}
        <span
          aria-hidden="true"
          style={{
            ...baseLayerStyle,
            color: GLITCH_B,
            opacity: copyOpacity,
            transform: `translateX(${bX}px) translateY(${bY}px)`,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "rgb-glitch-text",
  type: "registry:component" as const,
  description:
    "One-shot RGB chromatic aberration glitch on text. Red/green/blue channel copies offset randomly during glitch window, then settle cleanly. Dark canvas.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/rgb-glitch-text/rgb-glitch-text.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/rgb-glitch-text.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

export default RGBGlitchText;
