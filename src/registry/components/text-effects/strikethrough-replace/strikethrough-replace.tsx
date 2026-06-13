"use client";

import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const strikethroughReplaceSchema = z.object({
  oldText: z.string(),
  newText: z.string(),
  strikeFrames: z.number().int().min(8).max(30).default(14),
  revealFrames: z.number().int().min(8).max(30).default(14),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("georgia"),
});

export type StrikethroughReplaceProps = z.infer<
  typeof strikethroughReplaceSchema
>;

// ---------------------------------------------------------------------------
// Motion constants
// ---------------------------------------------------------------------------

/** literary-ease → cubic-bezier(0.25, 0.46, 0.45, 0.94) */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
const BRAND_ACCENT = "#f59e0b"; // --vantage-accent (strikethrough line)
const BRAND_MUTED = "#9ca3af"; // --vantage-muted (struck-out text)

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------

function resolveFontFamily(font: StrikethroughReplaceProps["font"]): string {
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
 * StrikethroughReplace — draws an amber strikethrough line across `oldText`,
 * fades it out, then fades `newText` in with a gentle upward slide.
 *
 * Timeline (frame-based, not duration-relative):
 *   0 .. strikeFrames          → strike line draws across oldText
 *   strikeFrames .. +8         → oldText fades out
 *   strikeFrames .. +revealFrames → newText fades in (overlap window)
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - oldText: --vantage-muted (#9ca3af) — secondary register while struck
 * - newText: --vantage-warm-white (#e8e0d0) — primary body
 * - Strike line: --vantage-accent (#f59e0b) — amber, one accent per scene
 * - Font: Georgia default (body register ≤56px rule)
 *
 * Upstream source: /tmp/remocn-inventory/registry/remocn/strikethrough-replace/index.tsx
 * Adaptation: brand dark canvas, amber accent strike line, Zod schema,
 * frame-count-based phases (not durationInFrames-relative), literary-ease.
 */
export function StrikethroughReplace({
  oldText,
  newText,
  strikeFrames = 14,
  revealFrames = 14,
  font = "georgia",
}: StrikethroughReplaceProps) {
  const frame = useCurrentFrame();

  const fontFamily = resolveFontFamily(font);
  // BRAND.md Rule 2: Georgia mandatory under 56px (Georgia default = body)
  const fontSize = font === "cormorant" ? 72 : 48;
  const fontWeight = font === "cormorant" ? 600 : 400;

  // Phase 1: strike line draws across oldText (0 → strikeFrames)
  const linePct = interpolate(frame, [0, strikeFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LITERARY_EASE,
  });

  // Phase 2: oldText fades out (strikeFrames → strikeFrames + 8)
  const oldOpacity = interpolate(
    frame,
    [strikeFrames, strikeFrames + 8],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LITERARY_EASE,
    },
  );

  // Phase 3: newText fades in (strikeFrames → strikeFrames + revealFrames)
  const newOpacity = interpolate(
    frame,
    [strikeFrames, strikeFrames + revealFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LITERARY_EASE,
    },
  );

  const newY = interpolate(
    frame,
    [strikeFrames, strikeFrames + revealFrames],
    [12, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LITERARY_EASE,
    },
  );

  const textBase: React.CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing: font === "cormorant" ? "-0.015em" : 0,
    whiteSpace: "nowrap",
    lineHeight: 1.3,
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
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* oldText — fades out as it gets struck */}
        <span
          style={{
            ...textBase,
            position: "absolute",
            color: BRAND_MUTED,
            opacity: oldOpacity,
          }}
        >
          {oldText}
          {/* Amber strikethrough line — one accent per scene */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              height: Math.max(2, Math.round(fontSize * 0.06)),
              width: `${linePct}%`,
              background: BRAND_ACCENT,
              transform: "translateY(-50%)",
              borderRadius: 2,
            }}
          />
        </span>

        {/* newText — slides up and fades in */}
        <span
          style={{
            ...textBase,
            color: BRAND_WARM_WHITE,
            opacity: newOpacity,
            transform: `translateY(${newY}px)`,
          }}
        >
          {newText}
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "strikethrough-replace",
  type: "registry:component" as const,
  description:
    "Draws an amber strikethrough across old text, fades it out, then reveals replacement text with upward slide. Literary ease, dark canvas, brand amber accent.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/strikethrough-replace/strikethrough-replace.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/strikethrough-replace.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

export default StrikethroughReplace;
