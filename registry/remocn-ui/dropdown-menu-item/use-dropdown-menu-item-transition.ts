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
  dropdownMenuItemStyle,
  dropdownMenuItemStyleContext,
  type DropdownMenuItemState,
  type DropdownMenuItemStyle,
} from "@/components/remocn/dropdown-menu-item";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 8;

/** Blend two row visuals: numbers lerp, colors via oklch mix. */
export function tweenDropdownMenuItemStyle(
  a: DropdownMenuItemStyle,
  b: DropdownMenuItemStyle,
  t: number,
): DropdownMenuItemStyle {
  return {
    scale: a.scale + (b.scale - a.scale) * t,
    background: mixOklch(a.background, b.background, t),
    labelColor: mixOklch(a.labelColor, b.labelColor, t),
  };
}

export interface DropdownMenuItemTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  primary?: string;
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) DropdownMenuItemStyle. The CALLER invokes
 * this; it reads the frame, the row component does not. Feed the result to
 * `<DropdownMenuItemRow style={...} />` (or the panel rows) for smooth transitions.
 */
export function useDropdownMenuItemTransition(
  steps: Step<DropdownMenuItemState>[],
  opts: DropdownMenuItemTransitionOptions = {},
): DropdownMenuItemStyle {
  const {
    theme: themeOverride,
    mode,
    primary,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(
    { ...themeOverride, ...(primary ? { primary } : {}) },
    mode,
  );
  const ctx = dropdownMenuItemStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "idle",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenDropdownMenuItemStyle(
    dropdownMenuItemStyle(from, ctx),
    dropdownMenuItemStyle(to, ctx),
    t,
  );
}
