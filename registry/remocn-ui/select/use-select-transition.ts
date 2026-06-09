"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  selectStyle,
  selectStyleContext,
  type SelectState,
  type SelectStyle,
} from "@/components/remocn/select";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/** Blend two select visuals: all fields are numbers, so a straight lerp. */
export function tweenSelectStyle(
  a: SelectStyle,
  b: SelectStyle,
  t: number,
): SelectStyle {
  return {
    panelOpacity: a.panelOpacity + (b.panelOpacity - a.panelOpacity) * t,
    panelScale: a.panelScale + (b.panelScale - a.panelScale) * t,
    panelTranslateY:
      a.panelTranslateY + (b.panelTranslateY - a.panelTranslateY) * t,
    chevronRotation:
      a.chevronRotation + (b.chevronRotation - a.chevronRotation) * t,
  };
}

export interface SelectTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) SelectStyle. The CALLER invokes this; it
 * reads the frame, the `<Select>` component does not. Feed the result to
 * `<Select style={...} />` for a smooth open/close.
 */
export function useSelectTransition(
  steps: Step<SelectState>[],
  opts: SelectTransitionOptions = {},
): SelectStyle {
  const { theme: themeOverride, mode, speed = 1, defaultDuration = DEFAULT_DURATION } =
    opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = selectStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "closed",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenSelectStyle(selectStyle(from, ctx), selectStyle(to, ctx), t);
}
