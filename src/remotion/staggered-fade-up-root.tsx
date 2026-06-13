import { registerRoot } from "remotion";
import { StaggeredFadeUpSampleRoot } from "../../examples/staggered-fade-up-sample";

function StaggeredFadeUpOnlyRoot() {
  return <StaggeredFadeUpSampleRoot />;
}

registerRoot(StaggeredFadeUpOnlyRoot);
