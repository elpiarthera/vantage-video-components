/**
 * CinematicCutSample — standalone Remotion composition demonstrating the
 * cinematic-cut transition between two solid-color scenes using BRAND.md
 * OKLCH colour tokens.
 *
 * Total: 90 frames @ 30fps = 3 seconds
 * Cut at frame 45 (midpoint)
 * Transition duration: 20 frames (literary-ease)
 */

import { AbsoluteFill, Composition } from "remotion";
import { CinematicCut } from "../src/registry/components/transitions/cinematic-cut/cinematic-cut";

// BRAND.md canonical tokens (sRGB fallbacks for composition rendering)
const BRAND = {
  bg: "#0a0a0a", // --vantage-bg         oklch(0.16 0 0)
  surface: "#141414", // --vantage-surface   oklch(0.18 0.008 290)
  accent: "#f59e0b", // --vantage-accent    oklch(0.74 0.16 60)
  prose: "#e5e7eb", // --vantage-prose     oklch(0.91 0 0)
  warmWhite: "#e8e0d0", // --vantage-warm-white oklch(0.93 0.01 80)
  heading: "#ffffff", // --vantage-heading  oklch(1 0 0)
} as const;

// Scene A — near-black canvas, warm heading
function SceneA() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 80,
          fontWeight: 700,
          color: BRAND.heading,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Before
      </div>
      {/* Amber accent line — single point per BRAND.md Rule 1 */}
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: BRAND.accent,
        }}
      />
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32,
          fontWeight: 400,
          color: BRAND.warmWhite,
          letterSpacing: 0,
        }}
      >
        Scene A
      </div>
    </AbsoluteFill>
  );
}

// Scene B — obsidian surface, prose text
function SceneB() {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.surface,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 80,
          fontWeight: 700,
          color: BRAND.heading,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        After
      </div>
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: BRAND.accent,
        }}
      />
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32,
          fontWeight: 400,
          color: BRAND.prose,
          letterSpacing: 0,
        }}
      >
        Scene B
      </div>
    </AbsoluteFill>
  );
}

function CinematicCutSampleComposition() {
  return (
    <CinematicCut
      direction="horizontal"
      duration={20}
      accentColor={BRAND.accent}
      easing="literary"
      transitionStart={45}
      from={<SceneA />}
      to={<SceneB />}
    />
  );
}

// Root registration for this sample
export function CinematicCutSampleRoot() {
  return (
    <Composition
      id="CinematicCutSample"
      component={CinematicCutSampleComposition}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
}

export default CinematicCutSampleComposition;
