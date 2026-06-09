"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  dropdownMenuStyle,
  dropdownMenuStyleContext,
  type DropdownMenuState,
  type DropdownMenuStyle,
} from "@/components/remocn/dropdown-menu";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/** Blend two menu visuals: all fields are numbers, so lerp each. */
export function tweenDropdownMenuStyle(
  a: DropdownMenuStyle,
  b: DropdownMenuStyle,
  t: number,
): DropdownMenuStyle {
  return {
    panelOpacity: a.panelOpacity + (b.panelOpacity - a.panelOpacity) * t,
    panelScale: a.panelScale + (b.panelScale - a.panelScale) * t,
    panelTranslateY:
      a.panelTranslateY + (b.panelTranslateY - a.panelTranslateY) * t,
    chevronRotation:
      a.chevronRotation + (b.chevronRotation - a.chevronRotation) * t,
  };
}

export interface DropdownMenuTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  primary?: string;
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) DropdownMenuStyle. The CALLER invokes
 * this; it reads the frame, the `<DropdownMenu>` component does not. Feed the
 * result to `<DropdownMenu style={...} />` for smooth transitions.
 */
export function useDropdownMenuTransition(
  steps: Step<DropdownMenuState>[],
  opts: DropdownMenuTransitionOptions = {},
): DropdownMenuStyle {
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
  const ctx = dropdownMenuStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "closed",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenDropdownMenuStyle(
    dropdownMenuStyle(from, ctx),
    dropdownMenuStyle(to, ctx),
    t,
  );
}
