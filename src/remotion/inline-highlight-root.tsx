import { registerRoot } from "remotion";
import { InlineHighlightSampleRoot } from "../../examples/inline-highlight-sample";

function InlineHighlightOnlyRoot() {
  return <InlineHighlightSampleRoot />;
}

registerRoot(InlineHighlightOnlyRoot);
