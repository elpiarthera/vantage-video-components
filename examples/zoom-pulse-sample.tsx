/**
 * ZoomPulseSample — standalone Remotion composition demonstrating the
 * zoom-pulse transition using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Zoom pulse: frames 0–30 (scaleFrom=0.92, scaleTo=1.06, literary-ease)
 * Hold at scaleTo: frames 30–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { ZoomPulse } from "../src/registry/components/transitions/zoom-pulse/zoom-pulse";

// BRAND.md canonical tokens (sRGB fallbacks for composition rendering)
const BRAND = {
  bg: "#0a0a0a",
  surface: "#141414",
  accent: "#f59e0b",
  warmWhite: "#e8e0d0",
  heading: "#ffffff",
} as const;

function ZoomPulseSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.surface,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "80px",
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
        Zoom Pulse
      </div>
      {/* Amber accent line — one per scene per BRAND.md Rule 1 */}
      <div style={{ width: 64, height: 4, backgroundColor: BRAND.accent }} />
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
        Dramatic hero reveal with scale overshoot. Literary ease — breath of an ebook cover.
      </div>
    </AbsoluteFill>
  );
}

function ZoomPulseSampleComp() {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <ZoomPulse
        scaleFrom={0.92}
        scaleTo={1.06}
        pulseFrames={30}
        easing="literary"
        startFrame={0}
      >
        <ZoomPulseSceneContent />
      </ZoomPulse>
    </AbsoluteFill>
  );
}

// Root export for use in src/remotion/Root.tsx
export function ZoomPulseSampleRoot() {
  return (
    <Composition
      id="ZoomPulseSample"
      component={ZoomPulseSampleComp}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
