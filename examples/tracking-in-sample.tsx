/**
 * TrackingInSample — standalone Remotion composition demonstrating the
 * tracking-in text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Tracking expands from 0.15em → -0.015em over spring duration (~22 frames)
 * Hold: frames 30–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { TrackingIn } from "../src/registry/components/text-effects/tracking-in/tracking-in";

const BRAND = {
  bg: "#0a0a0a",
  accent: "#f59e0b",
} as const;

function TrackingInSceneContent() {
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
      <TrackingIn
        text="Letters arrive."
        startLetterSpacing={0.2}
        startBlur={10}
        durationFrames={22}
        easing="literary"
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

export function TrackingInSampleRoot() {
  return (
    <Composition
      id="TrackingInSample"
      component={TrackingInSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
