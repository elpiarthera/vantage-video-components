"use client";

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

export const typewriterSchema = z.object({
  text: z.string(),
  charsPerSec: z.number().min(8).max(80).default(24),
  cursor: z.boolean().default(true),
  accentColor: z.string().default("#f59e0b"),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("cormorant"),
});

export type TypewriterProps = z.infer<typeof typewriterSchema>;

// ---------------------------------------------------------------------------
// Motion constants (BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, weighty. For narrative text reveals.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

// ---------------------------------------------------------------------------
// Brand tokens (BRAND.md canonical sRGB fallbacks)
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white (never pure #fff for body)
const BRAND_ACCENT = "#f59e0b"; // --vantage-accent oklch(0.74 0.16 60)

// ---------------------------------------------------------------------------
// Font resolution (BRAND.md typography: Cormorant ≥56px, Georgia below)
// ---------------------------------------------------------------------------

function resolveFontFamily(font: TypewriterProps["font"]): string {
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
 * Typewriter — reveals text character by character at `charsPerSec` rate.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a, near-black canvas)
 * - Text: --vantage-warm-white (#e8e0d0) — never pure white on near-black
 * - Cursor: --vantage-accent (#f59e0b) warm amber — one accent per scene
 * - Font: Cormorant Display (reel hero), Georgia (body), system-ui (caption)
 * - Motion: literary-ease for the reveal entrance
 *
 * Remotion primitives: AbsoluteFill + useCurrentFrame + interpolate.
 * No @remotion/transitions TransitionSeries API used.
 */
export function Typewriter({
  text,
  charsPerSec = 24,
  cursor = true,
  accentColor = "#f59e0b",
  font = "cormorant",
}: TypewriterProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalRevealFrames = (text.length / charsPerSec) * fps;

  const revealed = Math.floor(
    interpolate(frame, [0, totalRevealFrames], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LITERARY_EASE,
    }),
  );

  const visibleText = text.substring(0, revealed);

  // Cursor blinks at 2Hz (every 0.5s = fps/2 frames per state)
  const isCursorVisible = Math.floor((frame / fps) * 2) % 2 === 0;

  // Resolve accent color: fallback to brand amber if oklch() provided
  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT
    : accentColor;

  const fontFamily = resolveFontFamily(font);

  // BRAND.md Rule 2: Cormorant ≥56px only; Georgia below 56px
  // At 56px we default to Cormorant (it's exactly at the threshold)
  const fontSize = font === "cormorant" ? 72 : 48;
  const letterSpacing = font === "cormorant" ? "-0.015em" : "-0.02em";
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
          letterSpacing,
          whiteSpace: "pre-wrap",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {visibleText}
        {cursor && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "0.06em",
              height: "1em",
              marginLeft: "0.04em",
              verticalAlign: "text-bottom",
              background: resolvedAccent,
              opacity: isCursorVisible ? 1 : 0,
            }}
          />
        )}
      </span>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "typewriter",
  type: "registry:component" as const,
  description:
    "Character-by-character text reveal with blinking cursor. Brand-aligned to BRAND.md OKLCH palette and Cormorant/Georgia typography.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/typewriter/typewriter.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/typewriter.tsx",
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

export default Typewriter;
