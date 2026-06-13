/**
 * StaggeredFadeUpSample — standalone Remotion composition demonstrating the
 * staggered-fade-up text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * 4 words × 8 stagger frames = last word starts at frame 24
 * Each word fades in over 12 frames → last word visible by frame 36
 */

import { AbsoluteFill, Composition } from "remotion";
import { StaggeredFadeUp } from "../src/registry/components/text-effects/staggered-fade-up/staggered-fade-up";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function StaggeredFadeUpSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StaggeredFadeUp
        words={["The", "future", "is", "written."]}
        staggerFrames={8}
        riseDistance={24}
        easing="literary"
      />
    </AbsoluteFill>
  );
}

export function StaggeredFadeUpSampleRoot() {
  return (
    <Composition
      id="StaggeredFadeUpSample"
      component={StaggeredFadeUpSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
