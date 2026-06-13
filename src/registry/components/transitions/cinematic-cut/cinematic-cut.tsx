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

export const cinematicCutSchema = z.object({
  direction: z
    .enum(["horizontal", "vertical", "diagonal"])
    .default("horizontal"),
  duration: z.number().int().min(8).max(60).default(20),
  accentColor: z.string().default("oklch(0.74 0.16 60)"),
  easing: z.enum(["literary", "snappy"]).default("literary"),
});

export type CinematicCutProps = z.infer<typeof cinematicCutSchema> & {
  /** The outgoing scene (before the cut). */
  from?: ReactNode;
  /** The incoming scene (after the cut). */
  to?: ReactNode;
  /** Frame at which the cut occurs. Defaults to midpoint of the composition. */
  transitionStart?: number;
};

// ---------------------------------------------------------------------------
// Motion constants (mapped from BRAND.md motion vocabulary)
// ---------------------------------------------------------------------------

/**
 * literary-ease  → cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Slow-in / slow-out. Contemplative, weighty. For narrative scene changes.
 */
const LITERARY_EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * snappy / ui-ease → cubic-bezier(0.4, 0, 0.2, 1)
 * Material standard. Brisker. For UI chrome and snappy cuts.
 */
const SNAPPY_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Colour tokens (BRAND.md canonical values — sRGB fallbacks)
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_PROSE = "#e5e7eb"; // --vantage-prose
const BRAND_ACCENT_FALLBACK = "#f59e0b"; // --vantage-accent hex fallback

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
        background: "#141414",
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
// Helper — derive CSS transform for each direction
// ---------------------------------------------------------------------------

function resolveTransforms(
  direction: CinematicCutProps["direction"],
  motionProgress: number,
): { fromTransform: string; toTransform: string } {
  // Outgoing frame slides out; incoming frame is revealed.
  // For a cinematic hard cut, motion is minimal — the key visual is the
  // 1-2 frame accent flash. Motion blur is simulated via scaleX/Y compression.

  const blurCompression = interpolate(
    motionProgress,
    [0, 0.5, 1],
    [1, 0.985, 1],
  );

  if (direction === "horizontal") {
    const fromOffsetX = motionProgress * -4; // subtle outgoing nudge (px-scale via %)
    return {
      fromTransform: `translateX(${fromOffsetX}%) scaleX(${blurCompression})`,
      toTransform: `scaleX(1)`,
    };
  }

  if (direction === "vertical") {
    const fromOffsetY = motionProgress * -4;
    return {
      fromTransform: `translateY(${fromOffsetY}%) scaleY(${blurCompression})`,
      toTransform: `scaleY(1)`,
    };
  }

  // diagonal — combined XY nudge
  const fromOffset = motionProgress * -3;
  return {
    fromTransform: `translate(${fromOffset}%, ${fromOffset}%) scale(${blurCompression})`,
    toTransform: `scale(1)`,
  };
}

// ---------------------------------------------------------------------------
// Accent flash (1-2 frame amber burst — BRAND.md light-leak restraint)
// ---------------------------------------------------------------------------

function AccentFlash({
  cutFrame,
  accentColor,
}: {
  cutFrame: number;
  accentColor: string;
}) {
  const frame = useCurrentFrame();

  // Flash spans 2 frames: peak at cutFrame, then rapid decay
  const flashOpacity = interpolate(
    frame,
    [cutFrame - 1, cutFrame, cutFrame + 2],
    [0, 0.28, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Resolve accentColor: if it's an oklch() value, provide hex fallback for
  // environments that might not support it in inline styles.
  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT_FALLBACK
    : accentColor;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 20% 30%, ${resolvedAccent}99, transparent 60%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CinematicCut({
  from,
  to,
  direction = "horizontal",
  duration = 20,
  accentColor = "oklch(0.74 0.16 60)",
  easing = "literary",
  transitionStart,
}: CinematicCutProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const cutFrame =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.5);

  const selectedEasing = easing === "literary" ? LITERARY_EASE : SNAPPY_EASE;

  // Motion progress drives the subtle outgoing-frame compression (motion blur proxy).
  // The actual "cut" is instantaneous — we simply show `from` before cutFrame and
  // `to` at or after cutFrame. The motion window is the duration prop.
  const blurWindow = Math.max(4, Math.floor(duration * 0.3));
  const blurStart = cutFrame - blurWindow;
  const blurEnd = cutFrame;

  const motionProgress = interpolate(frame, [blurStart, blurEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: selectedEasing,
  });

  const isAfterCut = frame >= cutFrame;

  const fromScene = from ?? <DefaultFromPanel />;
  const toScene = to ?? <DefaultToPanel />;

  const { fromTransform } = resolveTransforms(direction, motionProgress);

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>
      {/* Outgoing scene (before cut) — applies subtle motion-blur compression */}
      {!isAfterCut && (
        <AbsoluteFill
          style={{
            transform: fromTransform,
            willChange: "transform",
            transformOrigin: "center center",
          }}
        >
          {fromScene}
        </AbsoluteFill>
      )}

      {/* Incoming scene (at and after cut frame) */}
      {isAfterCut && (
        <AbsoluteFill style={{ willChange: "transform" }}>
          {toScene}
        </AbsoluteFill>
      )}

      {/* One-frame accent burst — BRAND.md doctrine: one accent per scene max */}
      <AccentFlash cutFrame={cutFrame} accentColor={accentColor} />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config object (shadcn registry metadata)
// ---------------------------------------------------------------------------

export const presentation = {
  name: "cinematic-cut",
  type: "registry:component" as const,
  description:
    "Cinematic hard-cut transition for Remotion with literary or snappy easing and a one-frame accent burst.",
  dependencies: ["remotion"],
  files: [
    {
      path: "src/registry/components/transitions/cinematic-cut/cinematic-cut.tsx",
      type: "registry:component" as const,
      target: "remotion/transitions/cinematic-cut.tsx",
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

export default CinematicCut;
