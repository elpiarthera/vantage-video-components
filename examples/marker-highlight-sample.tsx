/**
 * MarkerHighlightSample — standalone Remotion composition demonstrating the
 * marker-highlight text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 60 frames @ 30fps = 2 seconds
 * Marker draw: frames 0–18 (literary-ease)
 */

import { AbsoluteFill, Composition } from "remotion";
import { MarkerHighlight } from "../src/registry/components/text-effects/marker-highlight/marker-highlight";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function MarkerHighlightSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MarkerHighlight
        text="The future is written."
        highlightWord="future"
        markerColor="rgba(245,158,11,0.35)"
        textShiftColor="#0a0a0a"
        drawFrames={18}
        easing="literary"
        startFrame={0}
      />
    </AbsoluteFill>
  );
}

export function MarkerHighlightSampleRoot() {
  return (
    <Composition
      id="MarkerHighlightSample"
      component={MarkerHighlightSceneContent}
      durationInFrames={60}
      fps={30}
      width={540}
      height={960}
    />
  );
}
