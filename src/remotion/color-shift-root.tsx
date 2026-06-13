/**
 * Standalone Remotion root for the ColorShiftSample composition.
 * Uses relative imports only — no @/ alias — so it works with the
 * Remotion webpack bundler without tsconfig-paths configuration.
 */
import { registerRoot } from "remotion";
import { ColorShiftSampleRoot } from "../../examples/color-shift-sample";

export function ColorShiftOnlyRoot() {
  return <ColorShiftSampleRoot />;
}

registerRoot(ColorShiftOnlyRoot);
