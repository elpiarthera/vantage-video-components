"use client";

import {
  easings,
  mixOklch,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  selectItemStyle,
  selectItemStyleContext,
  type SelectItemState,
  type SelectItemStyle,
} from "@/components/remocn/select-item";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 8;

/** Blend two select-item visuals: numbers lerp, colors via oklch mix. */
export function tweenSelectItemStyle(
  a: SelectItemStyle,
  b: SelectItemStyle,
  t: number,
): SelectItemStyle {
  return {
    background: mixOklch(a.background, b.background, t),
    labelColor: mixOklch(a.labelColor, b.labelColor, t),
    checkOpacity: a.checkOpacity + (b.checkOpacity - a.checkOpacity) * t,
    scale: a.scale + (b.scale - a.scale) * t,
  };
}

export interface SelectItemTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) SelectItemStyle. The CALLER invokes this;
 * it reads the frame, the `<SelectItem>` component does not. Feed the result to
 * `<SelectItem style={...} />` (or a `SelectItemRow`) for smooth transitions.
 */
export function useSelectItemTransition(
  steps: Step<SelectItemState>[],
  opts: SelectItemTransitionOptions = {},
): SelectItemStyle {
  const { theme: themeOverride, mode, speed = 1, defaultDuration = DEFAULT_DURATION } =
    opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = selectItemStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "idle",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenSelectItemStyle(
    selectItemStyle(from, ctx),
    selectItemStyle(to, ctx),
    t,
  );
}
