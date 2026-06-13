/**
 * InlineHighlightSample — standalone Remotion composition demonstrating the
 * inline-highlight text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 60 frames @ 30fps = 2 seconds
 * Color transition: frames 0–24 (literary-ease)
 */

import { AbsoluteFill, Composition } from "remotion";
import { InlineHighlight } from "../src/registry/components/text-effects/inline-highlight/inline-highlight";

const BRAND = {
  bg: "#0a0a0a",
  accent: "#f59e0b",
} as const;

function InlineHighlightSceneContent() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <InlineHighlight
        text="Only one answer matters."
        highlightWord="one"
        fromColor="#c9b99a"
        toColor={BRAND.accent}
        durationFrames={24}
        easing="literary"
        startFrame={0}
      />
    </AbsoluteFill>
  );
}

export function InlineHighlightSampleRoot() {
  return (
    <Composition
      id="InlineHighlightSample"
      component={InlineHighlightSceneContent}
      durationInFrames={60}
      fps={30}
      width={540}
      height={960}
    />
  );
}
