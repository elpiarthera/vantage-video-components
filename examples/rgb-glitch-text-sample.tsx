/**
 * RGBGlitchTextSample — standalone Remotion composition demonstrating the
 * rgb-glitch-text effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 60 frames @ 30fps = 2 seconds
 * RGB glitch fires frames 0–10, then text stabilises into --vantage-warm-white
 */

import { AbsoluteFill, Composition } from "remotion";
import { RGBGlitchText } from "../src/registry/components/text-effects/rgb-glitch-text/rgb-glitch-text";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function RGBGlitchTextSceneContent() {
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
      <RGBGlitchText
        text="SIGNAL"
        glitchFrames={10}
        offsetPx={4}
        font="cormorant"
      />
    </AbsoluteFill>
  );
}

export function RGBGlitchTextSampleRoot() {
  return (
    <Composition
      id="RGBGlitchTextSample"
      component={RGBGlitchTextSceneContent}
      durationInFrames={60}
      fps={30}
      width={540}
      height={960}
    />
  );
}
