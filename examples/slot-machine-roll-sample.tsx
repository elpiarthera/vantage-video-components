/**
 * SlotMachineRollSample — standalone Remotion composition demonstrating the
 * slot-machine-roll text-effect using BRAND.md OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Columns stagger-roll from "$99" → "$199" over 30 frames + offset stagger
 * Hold: frames 60–90
 */

import { AbsoluteFill, Composition } from "remotion";
import { SlotMachineRoll } from "../src/registry/components/text-effects/slot-machine-roll/slot-machine-roll";

const BRAND = {
  bg: "#0a0a0a",
  accent: "#f59e0b",
} as const;

function SlotMachineRollSceneContent() {
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
      <SlotMachineRoll
        from="$99"
        to="$199"
        rollFrames={30}
        accentColor={BRAND.accent}
        font="georgia"
      />
    </AbsoluteFill>
  );
}

export function SlotMachineRollSampleRoot() {
  return (
    <Composition
      id="SlotMachineRollSample"
      component={SlotMachineRollSceneContent}
      durationInFrames={90}
      fps={30}
      width={540}
      height={960}
    />
  );
}
