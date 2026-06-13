import { registerRoot } from "remotion";
import { TypewriterSampleRoot } from "../../examples/typewriter-sample";

function TypewriterOnlyRoot() {
  return <TypewriterSampleRoot />;
}

registerRoot(TypewriterOnlyRoot);
