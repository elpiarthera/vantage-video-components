import { registerRoot } from "remotion";
import { MarkerHighlightSampleRoot } from "../../examples/marker-highlight-sample";

function MarkerHighlightOnlyRoot() {
  return <MarkerHighlightSampleRoot />;
}

registerRoot(MarkerHighlightOnlyRoot);
