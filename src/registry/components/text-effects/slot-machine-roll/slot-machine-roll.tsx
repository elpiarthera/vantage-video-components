"use client";

import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema + types
// ---------------------------------------------------------------------------

export const slotMachineRollSchema = z.object({
  from: z.string().default("$99"),
  to: z.string().default("$199"),
  rollFrames: z.number().int().min(8).max(80).default(30),
  accentColor: z.string().default("#f59e0b"),
  font: z.enum(["cormorant", "georgia", "system-ui"]).default("georgia"),
});

export type SlotMachineRollProps = z.infer<typeof slotMachineRollSchema>;

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BG = "#0a0a0a"; // --vantage-bg
const BRAND_WARM_WHITE = "#e8e0d0"; // --vantage-warm-white
const BRAND_ACCENT = "#f59e0b"; // --vantage-accent

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------

function resolveFontFamily(font: SlotMachineRollProps["font"]): string {
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
 * SlotMachineRoll — each character column scrolls vertically from `from` to `to`.
 *
 * Brand alignment (BRAND.md):
 * - Background: --vantage-bg (#0a0a0a)
 * - Text: --vantage-warm-white (#e8e0d0)
 * - Accent: --vantage-accent (#f59e0b) for highlighted changed characters
 * - Font: Georgia default (body-register), Cormorant for title hero use
 *
 * Upstream source: /tmp/remocn-inventory/registry/remocn/slot-machine-roll/index.tsx
 * Adaptation: brand tokens, Zod schema, accentColor on changed columns,
 * staggered spring config from BRAND.md §3.
 */
export function SlotMachineRoll({
  from = "$99",
  to = "$199",
  rollFrames = 30,
  accentColor = "#f59e0b",
  font = "georgia",
}: SlotMachineRollProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BRAND.md Rule 2: Cormorant ≥56px only
  const fontSize = font === "cormorant" ? 72 : 56;
  const fontFamily = resolveFontFamily(font);
  const fontWeight = font === "cormorant" ? 600 : 700;

  const resolvedAccent = accentColor.startsWith("oklch(")
    ? BRAND_ACCENT
    : accentColor;

  const len = Math.max(from.length, to.length);
  const paddedFrom = from.padStart(len, " ");
  const paddedTo = to.padStart(len, " ");

  // rollFrames controls stagger interval between columns (total roll duration)
  const staggerPerCol = Math.max(1, Math.floor(rollFrames / Math.max(len, 1)));

  const columns = [];
  for (let i = 0; i < len; i++) {
    const raw = spring({
      frame: frame - i * staggerPerCol,
      fps,
      config: {
        damping: 14,
        stiffness: 80,
        mass: 1.2,
      },
    });
    const t = Math.max(0, Math.min(1, raw));

    const charChanged = paddedFrom[i] !== paddedTo[i];
    const charColor =
      charChanged && t > 0.9 ? resolvedAccent : BRAND_WARM_WHITE;

    columns.push(
      <span
        key={`col-${i}-${paddedFrom[i]}-${paddedTo[i]}`}
        style={{
          display: "inline-block",
          overflow: "hidden",
          height: "1.1em",
          lineHeight: "1.1em",
          verticalAlign: "top",
          width: "0.7em",
          textAlign: "center",
          color: charColor,
          transition: "color 0.1s",
        }}
      >
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            transform: `translateY(${-t * fontSize * 1.1}px)`,
          }}
        >
          <span>{paddedFrom[i]}</span>
          <span>{paddedTo[i]}</span>
        </span>
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
          fontSize,
          fontWeight,
          fontFamily,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {columns}
      </span>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Presentation config
// ---------------------------------------------------------------------------

export const presentation = {
  name: "slot-machine-roll",
  type: "registry:component" as const,
  description:
    "Character columns scroll vertically from one value to another, slot-machine style. Changed characters highlight in brand amber on landing.",
  dependencies: ["remotion", "zod"],
  files: [
    {
      path: "src/registry/components/text-effects/slot-machine-roll/slot-machine-roll.tsx",
      type: "registry:component" as const,
      target: "remotion/text-effects/slot-machine-roll.tsx",
    },
  ],
} satisfies {
  name: string;
  type: "registry:component";
  description: string;
  dependencies: string[];
  files: { path: string; type: "registry:component"; target: string }[];
};

export default SlotMachineRoll;
