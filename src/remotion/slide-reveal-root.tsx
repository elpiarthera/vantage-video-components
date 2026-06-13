/**
 * Standalone Remotion root for the SlideRevealSample composition.
 * Uses relative imports only — no @/ alias — so it works with the
 * Remotion webpack bundler without tsconfig-paths configuration.
 */
import { registerRoot } from "remotion";
import { SlideRevealSampleRoot } from "../../examples/slide-reveal-sample";

export function SlideRevealOnlyRoot() {
  return <SlideRevealSampleRoot />;
}

registerRoot(SlideRevealOnlyRoot);
