/**
 * Standalone Remotion root for the CinematicCutSample composition.
 * Uses relative imports only — no @/ alias — so it works with the
 * Remotion webpack bundler without tsconfig-paths configuration.
 */
import { registerRoot } from "remotion";
import { CinematicCutSampleRoot } from "../../examples/cinematic-cut-sample";

export function CinematicCutOnlyRoot() {
  return <CinematicCutSampleRoot />;
}

registerRoot(CinematicCutOnlyRoot);
