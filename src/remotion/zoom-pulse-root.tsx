/**
 * Standalone Remotion root for the ZoomPulseSample composition.
 * Uses relative imports only — no @/ alias — so it works with the
 * Remotion webpack bundler without tsconfig-paths configuration.
 */
import { registerRoot } from "remotion";
import { ZoomPulseSampleRoot } from "../../examples/zoom-pulse-sample";

export function ZoomPulseOnlyRoot() {
  return <ZoomPulseSampleRoot />;
}

registerRoot(ZoomPulseOnlyRoot);
