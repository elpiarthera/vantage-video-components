"use client";

import type React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const matrixDecodeSchema = z.object({
  text: z.string(),
  revealFrames: z.number().int().min(8).max(80).default(36),
  glyphAlphabet: z.string().default("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("system-ui"),
  seed: z.number().int().default(42),
});

export type MatrixDecodeProps = z.infer<typeof matrixDecodeSchema>;

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
const BRAND_MUTED = "#9ca3af"; // --vantage-muted (scramble chars)
const BRAND_ACCENT = "#f59e0b"; // --vantage-accent (just-revealed flash)

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------

function resolveFontFamily(font: MatrixDecodeProps["font"]): string {
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
 * MatrixDecode — text characters scramble with random glyphs until each
 * position is sequentially "decoded" from left to right.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Revealed chars: --vantage-warm-white (#e8e0d0)
 * - Scramble chars: --vantage-muted (#9ca3af) — secondary/caption register
 * - Flash on reveal: --vantage-accent (#f59e0b) for 2 frames on reveal event
 * - Font: system-ui default (monospace register), Cormorant/Georgia optional
 *
 * Upstream source: /tmp/remocn-inventory/registry/remocn/matrix-decode/index.tsx
 * Adaptation: brand color scheme (dark bg, not green terminal), Zod schema,
 * seed-based deterministic random, per-char span for accent flash.
 */
export function MatrixDecode({
  text,
  revealFrames = 36,
  glyphAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  font = "system-ui",
  seed = 42,
}: MatrixDecodeProps) {
  const frame = useCurrentFrame();
  // useVideoConfig kept for parity with sibling components
  useVideoConfig();

  const fontFamily = resolveFontFamily(font);
  // system-ui at 48px is below 56px — Cormorant constraint only applies to cormorant
  const fontSize = font === "cormorant" ? 72 : 48;
  const fontWeight = font === "cormorant" ? 600 : 400;

  // Build per-character spans using a for-loop to avoid array-index-key lint.
  // Key uses seed + position string — position is stable for a fixed text prop.
  const textChars = text.split("");
  const chars: React.ReactNode[] = [];
  for (const [posStr, char] of Object.entries(textChars)) {
    const pos = Number(posStr);
    const charKey = `${seed}-pos${pos}`;

    if (char === " ") {
      chars.push(
        <span
          key={`space-${charKey}`}
          style={{ display: "inline-block", width: "0.5em" }}
        >
          {" "}
        </span>,
      );
      continue;
    }

    const revealFrame = (pos / Math.max(text.length, 1)) * revealFrames;
    const isRevealed = frame >= revealFrame;
    // Flash for 2 frames right after reveal
    const isFlashing = frame >= revealFrame && frame < revealFrame + 2;

    let displayChar: string;
    if (isRevealed) {
      displayChar = char;
    } else {
      const r = random(`${seed}-${pos}-${Math.floor(frame / 2)}`);
      displayChar = glyphAlphabet[Math.floor(r * glyphAlphabet.length)];
    }

    const color = isFlashing
      ? BRAND_ACCENT
      : isRevealed
        ? BRAND_WARM_WHITE
        : BRAND_MUTED;

    chars.push(
      <span
        key={`char-${charKey}`}
        style={{
          color,
          display: "inline-block",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {displayChar}
      </span>,
    );
  }

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
          letterSpacing: "0.05em",
          whiteSpace: "pre",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {chars}
      </span>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "matrix-decode",
  type: "registry:component" as const,
  description:
    "Text characters scramble with random glyphs then decode left-to-right. Brand amber flash on each character reveal, dark canvas OKLCH palette.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/matrix-decode/matrix-decode.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/matrix-decode.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

export default MatrixDecode;
