/**
 * FadeBlurSample — standalone Remotion composition demonstrating the
 * fade-blur transition using BRAND.md OKLCH colour tokens.
 *
 * Total: 60 frames @ 30fps = 2 seconds
 * Fade-in: frames 0–20 (literary-ease, blurMax=12)
 * Hold: frames 20–40
 * Fade-out: frames 40–60 (literary-ease)
 */

import { AbsoluteFill, Composition, Sequence } from "remotion";
import { FadeBlur } from "../src/registry/components/transitions/fade-blur/fade-blur";

// BRAND.md canonical tokens (sRGB fallbacks for composition rendering)
const BRAND = {
  bg: "#0a0a0a",       // --vantage-bg         oklch(0.16 0 0)
  surface: "#141414",  // --vantage-surface     oklch(0.18 0.008 290)
  accent: "#f59e0b",   // --vantage-accent      oklch(0.74 0.16 60)
  prose: "#e5e7eb",    // --vantage-prose       oklch(0.91 0 0)
  warmWhite: "#e8e0d0", // --vantage-warm-white oklch(0.93 0.01 80)
  heading: "#ffffff",  // --vantage-heading     oklch(1 0 0)
} as const;

// Scene content — demonstrates fade-blur entrance per BRAND.md Example B
function FadeBlurSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
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
        Fade Blur Transition
      </div>
      {/* Amber accent line — one per scene per BRAND.md Rule 1 */}
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: BRAND.accent,
        }}
      />
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
        Opacity and blur interpolated together for a soft editorial entrance.
      </div>
    </AbsoluteFill>
  );
}

// Composition component
function FadeBlurSampleComp() {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {/* Fade IN — frames 0..20 */}
      <Sequence from={0} durationInFrames={40}>
        <FadeBlur
          direction="in"
          durationFrames={20}
          blurMax={12}
          easing="literary"
          startFrame={0}
        >
          <FadeBlurSceneContent />
        </FadeBlur>
      </Sequence>

      {/* Fade OUT — frames 40..60 */}
      <Sequence from={40} durationInFrames={20}>
        <FadeBlur
          direction="out"
          durationFrames={20}
          blurMax={12}
          easing="literary"
          startFrame={0}
        >
          <FadeBlurSceneContent />
        </FadeBlur>
      </Sequence>
    </AbsoluteFill>
  );
}

// Root export for use in src/remotion/Root.tsx
export function FadeBlurSampleRoot() {
  return (
    <Composition
      id="FadeBlurSample"
      component={FadeBlurSampleComp}
      durationInFrames={60}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
