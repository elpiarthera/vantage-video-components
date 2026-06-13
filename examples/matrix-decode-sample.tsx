/**
 * MatrixDecodeSample — standalone Remotion composition demonstrating the
 * matrix-decode text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Characters decode left-to-right over 36 frames with amber flash on reveal
 * Hold: frames 36–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { MatrixDecode } from "../src/registry/components/text-effects/matrix-decode/matrix-decode";

const BRAND = {
  bg: "#0a0a0a",
} as const;

function MatrixDecodeSceneContent() {
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
      <MatrixDecode
        text="TRUTH DECODED"
        revealFrames={36}
        glyphAlphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        font="system-ui"
        seed={42}
      />
    </AbsoluteFill>
  );
}

export function MatrixDecodeSampleRoot() {
  return (
    <Composition
      id="MatrixDecodeSample"
      component={MatrixDecodeSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
