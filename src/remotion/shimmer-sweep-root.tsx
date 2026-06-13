import { registerRoot } from "remotion";
import { ShimmerSweepSampleRoot } from "../../examples/shimmer-sweep-sample";

function ShimmerSweepOnlyRoot() {
  return <ShimmerSweepSampleRoot />;
}

registerRoot(ShimmerSweepOnlyRoot);
