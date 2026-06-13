/**
 * ColorShiftSample — standalone Remotion composition demonstrating the
 * color-shift transition using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Shift from vantage-bg (#0a0a0a) to vantage-accent (#f59e0b) over 30 frames
 * Then shift back from accent to bg over 30 frames
 * Hold on bg for final 30 frames
 *
 * Brand alignment: one color-shift per scene max per BRAND.md doctrine.
 */

import { AbsoluteFill, Composition, Sequence } from "remotion";
import { ColorShift } from "../src/registry/components/transitions/color-shift/color-shift";

// BRAND.md canonical tokens (sRGB fallbacks for composition rendering)
const BRAND = {
  bg: "#0a0a0a",       // --vantage-bg
  accent: "#f59e0b",   // --vantage-accent
  warmWhite: "#e8e0d0", // --vantage-warm-white
  heading: "#ffffff",
} as const;

function OverlayText() {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "80px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 56,
          fontWeight: 700,
          color: BRAND.heading,
          letterSpacing: "-0.015em",
          textAlign: "center",
        }}
      >
        Color Shift
      </div>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 28,
          fontWeight: 400,
          color: BRAND.warmWhite,
          letterSpacing: 0,
          lineHeight: 1.6,
          textAlign: "center",
          maxWidth: 640,
        }}
      >
        Background interpolates between BRAND.md OKLCH-anchored tokens.
      </div>
    </AbsoluteFill>
  );
}

function ColorShiftSampleComp() {
  return (
    <AbsoluteFill>
      {/* Shift: bg → accent, frames 0..30 */}
      <Sequence from={0} durationInFrames={30}>
        <ColorShift
          fromColor={BRAND.bg}
          toColor={BRAND.accent}
          durationFrames={30}
          easing="literary"
          startFrame={0}
        >
          <OverlayText />
        </ColorShift>
      </Sequence>

      {/* Shift back: accent → bg, frames 30..60 */}
      <Sequence from={30} durationInFrames={30}>
        <ColorShift
          fromColor={BRAND.accent}
          toColor={BRAND.bg}
          durationFrames={30}
          easing="literary"
          startFrame={30}
        >
          <OverlayText />
        </ColorShift>
      </Sequence>

      {/* Hold on bg, frames 60..90 */}
      <Sequence from={60} durationInFrames={30}>
        <ColorShift
          fromColor={BRAND.bg}
          toColor={BRAND.bg}
          durationFrames={30}
          easing="literary"
          startFrame={60}
        >
          <OverlayText />
        </ColorShift>
      </Sequence>
    </AbsoluteFill>
  );
}

// Root export for use in src/remotion/Root.tsx
export function ColorShiftSampleRoot() {
  return (
    <Composition
      id="ColorShiftSample"
      component={ColorShiftSampleComp}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
