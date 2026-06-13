/**
 * StrikethroughReplaceSample — standalone Remotion composition demonstrating
 * the strikethrough-replace effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Phase 1 (0–14): amber strike line draws across "Complicated"
 * Phase 2 (14–22): "Complicated" fades out
 * Phase 2 (14–28): "Simple" slides in with literary ease
 * Hold: frames 28–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { StrikethroughReplace } from "../src/registry/components/text-effects/strikethrough-replace/strikethrough-replace";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function StrikethroughReplaceSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
      }}
    >
      <StrikethroughReplace
        oldText="Complicated"
        newText="Simple"
        strikeFrames={14}
        revealFrames={14}
        font="georgia"
      />
    </AbsoluteFill>
  );
}

export function StrikethroughReplaceSampleRoot() {
  return (
    <Composition
      id="StrikethroughReplaceSample"
      component={StrikethroughReplaceSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
