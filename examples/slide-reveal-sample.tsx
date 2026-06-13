/**
 * SlideRevealSample — standalone Remotion composition demonstrating the
 * slide-reveal transition using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Line 1 slides in from left at frame 0 (24 frames)
 * Line 2 slides in from left at frame 20 (24 frames)
 * Line 3 slides in from left at frame 40 (24 frames)
 */

import { AbsoluteFill, Composition, Sequence } from "remotion";
import { SlideReveal } from "../src/registry/components/transitions/slide-reveal/slide-reveal";

// BRAND.md canonical tokens (sRGB fallbacks for composition rendering)
const BRAND = {
  bg: "#0a0a0a",
  accent: "#f59e0b",
  warmWhite: "#e8e0d0",
  heading: "#ffffff",
  prose: "#e5e7eb",
} as const;

function TextLine({ text, size = 28 }: { text: string; size?: number }) {
  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: size,
        fontWeight: 400,
        color: BRAND.warmWhite,
        letterSpacing: 0,
        lineHeight: 1.6,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

function SlideRevealSampleComp() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "80px",
        overflow: "hidden",
      }}
    >
      {/* Title — cut in (no slide on H1 per BRAND.md doctrine) */}
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
        Slide Reveal
      </div>
      {/* Amber accent line — one per scene */}
      <div style={{ width: 64, height: 4, backgroundColor: BRAND.accent }} />

      {/* Body lines slide in sequentially from left */}
      <Sequence from={0} durationInFrames={90}>
        <SlideReveal direction="left" durationFrames={24} distance={1} easing="literary" startFrame={0}>
          <TextLine text="Content enters from off-screen along the chosen axis." />
        </SlideReveal>
      </Sequence>

      <Sequence from={20} durationInFrames={70}>
        <SlideReveal direction="left" durationFrames={24} distance={1} easing="literary" startFrame={20}>
          <TextLine text="Each line arrives independently, settling into place." />
        </SlideReveal>
      </Sequence>

      <Sequence from={40} durationInFrames={50}>
        <SlideReveal direction="left" durationFrames={24} distance={1} easing="literary" startFrame={40}>
          <TextLine text="Literary ease — contemplative, unhurried." />
        </SlideReveal>
      </Sequence>
    </AbsoluteFill>
  );
}

// Root export for use in src/remotion/Root.tsx
export function SlideRevealSampleRoot() {
  return (
    <Composition
      id="SlideRevealSample"
      component={SlideRevealSampleComp}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
