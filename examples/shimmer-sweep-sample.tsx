/**
 * ShimmerSweepSample — standalone Remotion composition demonstrating the
 * shimmer-sweep text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 60 frames @ 30fps = 2 seconds
 * Sweep: frames 0–45 (snappy-ease)
 */

import { AbsoluteFill, Composition } from "remotion";
import { ShimmerSweep } from "../src/registry/components/text-effects/shimmer-sweep/shimmer-sweep";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function ShimmerSweepSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ShimmerSweep
        text="Vantage"
        baseColor="#9ca3af"
        sweepColor="#f59e0b"
        sweepFrames={45}
        easing="snappy"
      />
    </AbsoluteFill>
  );
}

export function ShimmerSweepSampleRoot() {
  return (
    <Composition
      id="ShimmerSweepSample"
      component={ShimmerSweepSceneContent}
      durationInFrames={60}
      fps={30}
      width={540}
      height={960}
    />
  );
}
