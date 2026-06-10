"use client";

import {
  easings,
  type Step,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  toastStyle,
  type ToastState,
  type ToastStyle,
} from "@/components/remocn/toast";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/**
 * Blend two toast visuals: every field lerps. `ToastStyle` carries no animated
 * colors (only transform + opacity), so there is no `mixOklch` here — but every
 * field is covered so neither enter nor dismiss freezes a channel.
 */
export function tweenToastStyle(
  a: ToastStyle,
  b: ToastStyle,
  t: number,
): ToastStyle {
  return {
    opacity: a.opacity + (b.opacity - a.opacity) * t,
    translateY: a.translateY + (b.translateY - a.translateY) * t,
    scale: a.scale + (b.scale - a.scale) * t,
  };
}

export interface ToastTransitionOptions {
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) ToastStyle. The CALLER invokes this; it
 * reads the frame, the `<Toast>` component does not. Feed the result to
 * `<Toast style={...} />`. Both the enter (hidden→visible) and the auto-dismiss
 * (visible→hidden) read from the same eased tween, so both look smooth.
 */
export function useToastTransition(
  steps: Step<ToastState>[],
  opts: ToastTransitionOptions = {},
): ToastStyle {
  const { speed = 1, defaultDuration = DEFAULT_DURATION } = opts;
  const { from, to, progress } = useStateTransition(
    steps,
    "hidden",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenToastStyle(toastStyle(from), toastStyle(to), t);
}
