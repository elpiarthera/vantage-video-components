"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  toggleGroupStyle,
  toggleGroupStyleContext,
  type ToggleGroupItem,
  type ToggleGroupState,
  type ToggleGroupStyle,
} from "@/components/remocn/toggle-group";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default segments — mirrors the component's default `items`. */
const DEFAULT_ITEMS: ToggleGroupItem[] = [
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 14;

/**
 * Blend two toggle-group visuals: `indicatorOffset` lerps (it's the only field).
 * The thumb position AND width, plus the label colors, all derive from this
 * single value inside the pure render — so a lerp slides the thumb without jumps.
 */
export function tweenToggleGroupStyle(
  a: ToggleGroupStyle,
  b: ToggleGroupStyle,
  t: number,
): ToggleGroupStyle {
  return {
    indicatorOffset:
      a.indicatorOffset + (b.indicatorOffset - a.indicatorOffset) * t,
  };
}

export interface ToggleGroupTransitionOptions {
  items?: ToggleGroupItem[];
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) ToggleGroupStyle. The CALLER invokes
 * this; it reads the frame, the `<ToggleGroup>` component does not. Feed the
 * result to `<ToggleGroup style={...} />` for a smooth sliding thumb.
 */
export function useToggleGroupTransition(
  steps: Step<ToggleGroupState>[],
  opts: ToggleGroupTransitionOptions = {},
): ToggleGroupStyle {
  const {
    items = DEFAULT_ITEMS,
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = toggleGroupStyleContext(items, theme);
  const { from, to, progress } = useStateTransition(
    steps,
    items[0].value,
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenToggleGroupStyle(
    toggleGroupStyle(from, ctx),
    toggleGroupStyle(to, ctx),
    t,
  );
}
