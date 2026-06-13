/**
 * TypewriterSample — standalone Remotion composition demonstrating the
 * typewriter text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Types 32 characters at 24 chars/sec ≈ 40 frames
 * Hold: frames 40–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { Typewriter } from "../src/registry/components/text-effects/typewriter/typewriter";

const BRAND = {
  bg: "#0a0a0a",
  accent: "#f59e0b",
  warmWhite: "#e8e0d0",
  heading: "#ffffff",
} as const;

function TypewriterSceneContent() {
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
      <Typewriter
        text="The future is written."
        charsPerSec={24}
        cursor={true}
        accentColor={BRAND.accent}
        font="cormorant"
      />
      {/* Amber accent line — one per scene per BRAND.md Rule 1 */}
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: BRAND.accent,
          marginTop: 16,
        }}
      />
    </AbsoluteFill>
  );
}

export function TypewriterSampleRoot() {
  return (
    <Composition
      id="TypewriterSample"
      component={TypewriterSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
