import { Composition, registerRoot } from "remotion";
import {
  GitHubStars,
  type GitHubStarsProps,
  SAMPLE_STARGAZERS,
} from "@/registry/remocn/github-stars";
import { CinematicCutSampleRoot } from "../../examples/cinematic-cut-sample";

/**
 * Sample props so the composition validates + renders standalone in the Remotion
 * bundle (Studio / pre-render). Real renders override these via `inputProps`.
 */
const DEFAULT_PROPS: GitHubStarsProps = {
  repo: "remotion-dev/remotion",
  totalStars: 24813,
  stargazers: SAMPLE_STARGAZERS,
  orientation: "horizontal",
  accentColor: "#ffbb00",
  speed: 1,
  theme: "light",
};

/**
 * Bundle root. Declares:
 * - `github-stars` — original demo composition
 * - `CinematicCutSample` — Phase B pilot: cinematic-cut transition demo
 */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="github-stars"
        component={GitHubStars}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
        defaultProps={DEFAULT_PROPS}
      />
      <CinematicCutSampleRoot />
    </>
  );
}

registerRoot(RemotionRoot);
