/**
 * Verification tests for the PURE / DETERMINISTIC parts of `toast`.
 *
 * Scope:
 *   - registry/remocn-ui/toast/index.tsx
 *       toastStyleContext(variant, theme)  — pure icon-color derivation
 *       toastStyle(state)                  — complete state→visual preset map
 *   - registry/remocn-ui/toast/use-toast-transition.ts
 *       tweenToastStyle(a, b, t)           — pure lerp across every field
 *       DEFAULT_DURATION constant
 *       useToastTransition resolver        — mirrored as resolveToastTransition
 *         with frame injected as `raw` (annotated source lines)
 *   - registry/remocn-ui/toast/config.ts
 *       toastConfig.controls wiring + toastConfig.snippet codegen
 *
 * The render path (index.tsx) imports `useRemocnTheme` which requires React
 * context — it is NOT exercised here. The pure-testable surface is everything
 * above.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/toast/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * Relative imports from component source; `@/lib/remocn-ui` alias for core.
 * Neither `toastStyle`, `toastStyleContext`, nor `tweenToastStyle` call
 * `useCurrentFrame()` at import or call time — they are pure value functions.
 * `useToastTransition` IS a hook (calls `useStateTransition` → `useCurrentFrame`)
 * and is NOT imported; we mirror its pure resolver body below.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  toastStyle,
  toastStyleContext,
  type ToastState,
  type ToastVariant,
} from "../index";
import {
  tweenToastStyle,
  DEFAULT_DURATION,
} from "../use-toast-transition";
import { toastConfig } from "../config";
import { defaultLightTheme, defaultDarkTheme, easings, clamp01 } from "@/lib/remocn-ui";
import type { Step } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

const VALID_STATES: readonly ToastState[] = ["hidden", "visible"];
const VALID_VARIANTS: readonly ToastVariant[] = ["default", "success", "error"];

/** Convenience wrapper for snippet(). */
type SnippetValues = {
  state?: string;
  title?: string;
  description?: string;
  variant?: string;
  mode?: string;
};
const snippet = (values: SnippetValues): string =>
  toastConfig.snippet(values as Record<string, unknown>);

// ===========================================================================
// 1. DEFAULT_DURATION constant
// ===========================================================================

describe("DEFAULT_DURATION", () => {
  it("is 12 frames", () => {
    expect(DEFAULT_DURATION).toBe(12);
  });
});

// ===========================================================================
// 2. toastStyle — pure (state) => ToastStyle map
//    MIRROR of index.tsx lines 69-76
// ===========================================================================

describe("toastStyle: hidden state — off-screen keyframe", () => {
  const s = toastStyle("hidden");

  it("opacity is 0 (invisible)", () => {
    expect(s.opacity).toBe(0);
  });

  it("translateY is 16 (enters from 16px below)", () => {
    expect(s.translateY).toBe(16);
  });

  it("scale is 0.97 (slightly shrunken at rest-hidden)", () => {
    expect(s.scale).toBeCloseTo(0.97, 10);
  });
});

describe("toastStyle: visible state — resting keyframe", () => {
  const s = toastStyle("visible");

  it("opacity is 1 (fully visible)", () => {
    expect(s.opacity).toBe(1);
  });

  it("translateY is 0 (at rest position)", () => {
    expect(s.translateY).toBe(0);
  });

  it("scale is 1 (full size)", () => {
    expect(s.scale).toBe(1);
  });
});

describe("toastStyle: both states are complete keyframes", () => {
  it("every ToastStyle field is defined and numeric for every state", () => {
    for (const state of VALID_STATES) {
      const s = toastStyle(state);
      expect(typeof s.opacity).toBe("number");
      expect(typeof s.translateY).toBe("number");
      expect(typeof s.scale).toBe("number");
    }
  });

  it("hidden and visible have distinct opacity (0 vs 1)", () => {
    expect(toastStyle("hidden").opacity).toBe(0);
    expect(toastStyle("visible").opacity).toBe(1);
  });

  it("hidden and visible have distinct translateY (16 vs 0)", () => {
    expect(toastStyle("hidden").translateY).toBe(16);
    expect(toastStyle("visible").translateY).toBe(0);
  });

  it("hidden and visible have distinct scale (0.97 vs 1)", () => {
    expect(toastStyle("hidden").scale).toBeCloseTo(0.97, 10);
    expect(toastStyle("visible").scale).toBe(1);
  });
});

// ===========================================================================
// 3. toastStyleContext — pure variant × theme → { iconColor }
//    MIRROR of index.tsx lines 55-62
// ===========================================================================

describe("toastStyleContext: default variant", () => {
  const ctx = toastStyleContext("default", defaultLightTheme);

  it("iconColor equals theme.mutedForeground", () => {
    expect(ctx.iconColor).toBe(defaultLightTheme.mutedForeground);
  });

  it("iconColor is a non-empty string", () => {
    expect(typeof ctx.iconColor).toBe("string");
    expect(ctx.iconColor.length).toBeGreaterThan(0);
  });
});

describe("toastStyleContext: success variant", () => {
  const ctx = toastStyleContext("success", defaultLightTheme);

  it("iconColor is the hardcoded green oklch string", () => {
    expect(ctx.iconColor).toBe("oklch(0.6 0.17 150)");
  });

  it("iconColor does NOT depend on the theme", () => {
    const ctxDark = toastStyleContext("success", defaultDarkTheme);
    expect(ctxDark.iconColor).toBe("oklch(0.6 0.17 150)");
  });
});

describe("toastStyleContext: error variant", () => {
  const ctxLight = toastStyleContext("error", defaultLightTheme);
  const ctxDark = toastStyleContext("error", defaultDarkTheme);

  it("iconColor equals theme.destructive for light theme", () => {
    expect(ctxLight.iconColor).toBe(defaultLightTheme.destructive);
  });

  it("iconColor equals theme.destructive for dark theme", () => {
    expect(ctxDark.iconColor).toBe(defaultDarkTheme.destructive);
  });

  it("light and dark destructive colors are different", () => {
    expect(ctxLight.iconColor).not.toBe(ctxDark.iconColor);
  });
});

describe("toastStyleContext: all variants return an object with only iconColor", () => {
  it("every variant produces a non-empty iconColor", () => {
    for (const variant of VALID_VARIANTS) {
      const ctx = toastStyleContext(variant, defaultLightTheme);
      expect(typeof ctx.iconColor).toBe("string");
      expect(ctx.iconColor.length).toBeGreaterThan(0);
    }
  });
});

// ===========================================================================
// 4. tweenToastStyle — pure lerp across all three fields
//    MIRROR of use-toast-transition.ts lines 23-33
// ===========================================================================

describe("tweenToastStyle: t=0 returns values equal to `a`", () => {
  const a = toastStyle("hidden");
  const b = toastStyle("visible");
  const r = tweenToastStyle(a, b, 0);

  it("opacity equals a.opacity at t=0", () => {
    expect(r.opacity).toBeCloseTo(a.opacity, 10);
  });

  it("translateY equals a.translateY at t=0", () => {
    expect(r.translateY).toBeCloseTo(a.translateY, 10);
  });

  it("scale equals a.scale at t=0", () => {
    expect(r.scale).toBeCloseTo(a.scale, 10);
  });
});

describe("tweenToastStyle: t=1 returns values equal to `b`", () => {
  const a = toastStyle("hidden");
  const b = toastStyle("visible");
  const r = tweenToastStyle(a, b, 1);

  it("opacity equals b.opacity at t=1", () => {
    expect(r.opacity).toBeCloseTo(b.opacity, 10);
  });

  it("translateY equals b.translateY at t=1", () => {
    expect(r.translateY).toBeCloseTo(b.translateY, 10);
  });

  it("scale equals b.scale at t=1", () => {
    expect(r.scale).toBeCloseTo(b.scale, 10);
  });
});

describe("tweenToastStyle: t=0.5 midpoint (hidden → visible)", () => {
  // hidden: opacity=0, translateY=16, scale=0.97
  // visible: opacity=1, translateY=0, scale=1
  // midpoint: opacity=0.5, translateY=8, scale=0.985
  const a = toastStyle("hidden");
  const b = toastStyle("visible");
  const r = tweenToastStyle(a, b, 0.5);

  it("opacity midpoint: 0 → 1 gives 0.5", () => {
    expect(r.opacity).toBeCloseTo(0.5, 10);
  });

  it("translateY midpoint: 16 → 0 gives 8", () => {
    expect(r.translateY).toBeCloseTo(8, 10);
  });

  it("scale midpoint: 0.97 → 1 gives 0.985", () => {
    expect(r.scale).toBeCloseTo(0.985, 10);
  });
});

describe("tweenToastStyle: t=0.5 midpoint (visible → hidden, dismiss direction)", () => {
  // Reverse direction: visible→hidden
  // midpoint: opacity=0.5, translateY=8, scale=0.985
  const a = toastStyle("visible");
  const b = toastStyle("hidden");
  const r = tweenToastStyle(a, b, 0.5);

  it("opacity midpoint: 1 → 0 gives 0.5", () => {
    expect(r.opacity).toBeCloseTo(0.5, 10);
  });

  it("translateY midpoint: 0 → 16 gives 8", () => {
    expect(r.translateY).toBeCloseTo(8, 10);
  });

  it("scale midpoint: 1 → 0.97 gives 0.985", () => {
    expect(r.scale).toBeCloseTo(0.985, 10);
  });
});

describe("tweenToastStyle: identity (a === b, any t)", () => {
  const s = toastStyle("visible");

  it("opacity is unchanged when both endpoints are the same", () => {
    expect(tweenToastStyle(s, s, 0.5).opacity).toBeCloseTo(s.opacity, 10);
  });

  it("translateY is unchanged when both endpoints are the same", () => {
    expect(tweenToastStyle(s, s, 0.5).translateY).toBeCloseTo(s.translateY, 10);
  });

  it("scale is unchanged when both endpoints are the same", () => {
    expect(tweenToastStyle(s, s, 0.5).scale).toBeCloseTo(s.scale, 10);
  });
});

describe("tweenToastStyle: t=0.25 quarter-point (hidden → visible)", () => {
  // opacity: 0 + 0.25*(1-0) = 0.25
  // translateY: 16 + 0.25*(0-16) = 12
  // scale: 0.97 + 0.25*(1-0.97) = 0.97+0.0075 = 0.9775
  const a = toastStyle("hidden");
  const b = toastStyle("visible");
  const r = tweenToastStyle(a, b, 0.25);

  it("opacity at t=0.25 is 0.25", () => {
    expect(r.opacity).toBeCloseTo(0.25, 10);
  });

  it("translateY at t=0.25 is 12", () => {
    expect(r.translateY).toBeCloseTo(12, 10);
  });

  it("scale at t=0.25 is 0.9775", () => {
    expect(r.scale).toBeCloseTo(0.9775, 10);
  });
});

// ===========================================================================
// 5. useToastTransition resolver replica
//    MIRRORS use-toast-transition.ts lines 47-60.
//    `useToastTransition` calls `useStateTransition` (which reads
//    `useCurrentFrame()`) then applies `easings.out(progress)` and
//    `tweenToastStyle`. We inject `raw` in place of `useCurrentFrame()`.
//
//    This replica re-derives only the logic BEYOND the core
//    `useStateTransition` (already tested in core/__tests__/timeline.test.ts).
//    The key additional contract: progress is eased with `easings.out` before
//    the tween, so the visible field values are out-eased, not linear.
//
//    MAINTENANCE CONTRACT: if use-toast-transition.ts lines 47-60 change,
//    update this replica in lockstep. Annotated source lines below.
// ===========================================================================

/** MIRROR of core/timeline.ts:clamp01. */
function clamp01Mirror(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** MIRROR of core/motion.ts:easings.out (cubic ease-out). */
function easingOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * MIRROR of timeline.ts:useStateTransition pure resolver body
 * (lines 55-73 of core/timeline.ts), with `raw` injected.
 */
function resolveStateTransition<S extends string>(
  raw: number,
  steps: Step<S>[],
  defaultState: S,
  speed = 1,
  defaultDuration = 8,
): { from: S; to: S; progress: number } {
  const effectiveFrame = raw * speed;
  const started = steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => a.step.at - b.step.at || a.index - b.index)
    .filter((e) => e.step.at <= effectiveFrame);
  if (started.length === 0)
    return { from: defaultState, to: defaultState, progress: 1 };
  const to = started[started.length - 1].step;
  const from = started.length >= 2 ? started[started.length - 2].step : null;
  const dur = to.duration ?? defaultDuration;
  const progress = dur > 0 ? clamp01Mirror((effectiveFrame - to.at) / dur) : 1;
  return { from: from ? from.state : defaultState, to: to.state, progress };
}

/**
 * MIRROR of use-toast-transition.ts:useToastTransition (lines 47-60).
 * `raw` is injected in place of useCurrentFrame().
 * Annotated source lines:
 *   line 51: destructure speed + defaultDuration from opts
 *   line 52-57: call useStateTransition (mirrored as resolveStateTransition)
 *   line 58: t = easings.out(progress)          ← MIRROR line 58
 *   line 59: tweenToastStyle(from, to, t)        ← MIRROR line 59
 */
function resolveToastTransition(
  raw: number,                                    // injected useCurrentFrame() — MIRROR line 52
  steps: Step<ToastState>[],
  speed = 1,
  defaultDuration = DEFAULT_DURATION,
): { style: ReturnType<typeof tweenToastStyle>; progress: number; from: ToastState; to: ToastState } {
  const { from, to, progress } = resolveStateTransition( // MIRROR lines 52-57
    raw,
    steps,
    "hidden",
    speed,
    defaultDuration,
  );
  const t = easingOut(progress);                         // MIRROR line 58
  const style = tweenToastStyle(toastStyle(from as ToastState), toastStyle(to as ToastState), t); // MIRROR line 59
  return { style, progress, from: from as ToastState, to: to as ToastState };
}

// ---------------------------------------------------------------------------
// Before any step: holds at hidden (progress=1, tween(hidden,hidden,out(1)))
// ---------------------------------------------------------------------------

describe("resolveToastTransition: before any step — holds at hidden", () => {
  it("returns the hidden style when no steps have started", () => {
    const { style } = resolveToastTransition(0, []);
    const hidden = toastStyle("hidden");
    // out(1)=1, so tween(hidden,hidden,1) = hidden
    expect(style.opacity).toBeCloseTo(hidden.opacity, 10);
    expect(style.translateY).toBeCloseTo(hidden.translateY, 10);
    expect(style.scale).toBeCloseTo(hidden.scale, 10);
  });

  it("from and to are both 'hidden' before any step", () => {
    const { from, to } = resolveToastTransition(0, []);
    expect(from).toBe("hidden");
    expect(to).toBe("hidden");
  });
});

// ---------------------------------------------------------------------------
// Exactly at a step boundary: progress=0, t=easings.out(0)=0
// ---------------------------------------------------------------------------

describe("resolveToastTransition: exactly at hidden→visible step boundary", () => {
  const steps: Step<ToastState>[] = [{ at: 10, state: "visible" }];

  it("at raw=10 exactly, progress=0, t=out(0)=0 → style equals hidden (from)", () => {
    const { style, progress } = resolveToastTransition(10, steps);
    expect(progress).toBe(0);
    // t = out(0) = 0, so style = tween(hidden, visible, 0) = hidden
    const hidden = toastStyle("hidden");
    expect(style.opacity).toBeCloseTo(hidden.opacity, 10);
    expect(style.translateY).toBeCloseTo(hidden.translateY, 10);
    expect(style.scale).toBeCloseTo(hidden.scale, 10);
  });

  it("from='hidden', to='visible' at the step boundary", () => {
    const { from, to } = resolveToastTransition(10, steps);
    expect(from).toBe("hidden");
    expect(to).toBe("visible");
  });
});

// ---------------------------------------------------------------------------
// Mid-window: easings.out applied to progress (non-linear)
// ---------------------------------------------------------------------------

describe("resolveToastTransition: mid-window uses easings.out (not linear)", () => {
  // step at=0, defaultDuration=12. At raw=6: linear progress=0.5, out(0.5)≈0.875
  // opacity: tween(0, 1, 0.875) = 0.875
  const steps: Step<ToastState>[] = [{ at: 0, state: "visible" }];

  it("opacity at raw=6 is tween(0,1,out(0.5)) ≈ 0.875 (not linear 0.5)", () => {
    const { style } = resolveToastTransition(6, steps, 1, 12);
    const expectedT = easingOut(0.5); // ≈ 0.875
    expect(style.opacity).toBeCloseTo(expectedT, 8);
  });

  it("translateY at raw=6 is tween(16,0,out(0.5)): 16*(1-out(0.5))", () => {
    const { style } = resolveToastTransition(6, steps, 1, 12);
    const t = easingOut(0.5);
    const expected = 16 * (1 - t); // lerp(16, 0, t)
    expect(style.translateY).toBeCloseTo(expected, 8);
  });

  it("scale at raw=6 is tween(0.97,1,out(0.5))", () => {
    const { style } = resolveToastTransition(6, steps, 1, 12);
    const t = easingOut(0.5);
    const expected = 0.97 + (1 - 0.97) * t;
    expect(style.scale).toBeCloseTo(expected, 8);
  });
});

// ---------------------------------------------------------------------------
// Past the window: progress=1, t=out(1)=1 → fully visible
// ---------------------------------------------------------------------------

describe("resolveToastTransition: past the transition window → fully visible", () => {
  const steps: Step<ToastState>[] = [{ at: 0, state: "visible" }];

  it("opacity is 1 after DEFAULT_DURATION frames", () => {
    const { style } = resolveToastTransition(DEFAULT_DURATION, steps);
    expect(style.opacity).toBeCloseTo(1, 10);
  });

  it("translateY is 0 after DEFAULT_DURATION frames", () => {
    const { style } = resolveToastTransition(DEFAULT_DURATION, steps);
    expect(style.translateY).toBeCloseTo(0, 10);
  });

  it("scale is 1 after DEFAULT_DURATION frames", () => {
    const { style } = resolveToastTransition(DEFAULT_DURATION, steps);
    expect(style.scale).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// Speed contract
// ---------------------------------------------------------------------------

describe("resolveToastTransition: speed contract", () => {
  // step at=12. speed=2: effectiveFrame = raw*2 → fires at raw=6.
  const steps: Step<ToastState>[] = [{ at: 12, state: "visible" }];

  it("speed=2: step at=12 fires at raw=6 (eff=12)", () => {
    const { to } = resolveToastTransition(6, steps, 2);
    expect(to).toBe("visible");
  });

  it("speed=2: step at=12 has NOT fired at raw=5 (eff=10 < 12)", () => {
    const { to } = resolveToastTransition(5, steps, 2);
    expect(to).toBe("hidden");
  });
});

// ===========================================================================
// 6. toastConfig.controls — customizer control wiring
// ===========================================================================

describe("toastConfig.controls: state", () => {
  it("state is a select control", () => {
    expect(toastConfig.controls.state.type).toBe("select");
  });

  it("state options are ['hidden', 'visible']", () => {
    const ctrl = toastConfig.controls.state;
    if (ctrl.type !== "select") throw new Error("expected select");
    expect(ctrl.options).toEqual(["hidden", "visible"]);
  });

  it("state default is 'visible' (shows the resting toast in the preview)", () => {
    expect(toastConfig.controls.state.default).toBe("visible");
  });

  it("every state option is a valid ToastState", () => {
    const ctrl = toastConfig.controls.state;
    if (ctrl.type !== "select") throw new Error("expected select");
    for (const opt of ctrl.options) {
      expect(VALID_STATES).toContain(opt as ToastState);
    }
  });
});

describe("toastConfig.controls: variant", () => {
  it("variant is a select control", () => {
    expect(toastConfig.controls.variant.type).toBe("select");
  });

  it("variant options are ['default', 'success', 'error']", () => {
    const ctrl = toastConfig.controls.variant;
    if (ctrl.type !== "select") throw new Error("expected select");
    expect(ctrl.options).toEqual(["default", "success", "error"]);
  });

  it("variant default is 'success'", () => {
    expect(toastConfig.controls.variant.default).toBe("success");
  });

  it("every variant option is a valid ToastVariant", () => {
    const ctrl = toastConfig.controls.variant;
    if (ctrl.type !== "select") throw new Error("expected select");
    for (const opt of ctrl.options) {
      expect(VALID_VARIANTS).toContain(opt as ToastVariant);
    }
  });
});

describe("toastConfig.controls: mode", () => {
  it("mode is a select control", () => {
    expect(toastConfig.controls.mode.type).toBe("select");
  });

  it("mode options are ['light', 'dark']", () => {
    const ctrl = toastConfig.controls.mode;
    if (ctrl.type !== "select") throw new Error("expected select");
    expect(ctrl.options).toEqual(["light", "dark"]);
  });

  it("mode default is 'light'", () => {
    expect(toastConfig.controls.mode.default).toBe("light");
  });
});

describe("toastConfig.controls: title and description", () => {
  it("title is a text control", () => {
    expect(toastConfig.controls.title.type).toBe("text");
  });

  it("description is a text control", () => {
    expect(toastConfig.controls.description.type).toBe("text");
  });

  it("title default is 'Changes saved'", () => {
    expect(toastConfig.controls.title.default).toBe("Changes saved");
  });
});

// ===========================================================================
// 7. toastConfig.snippet — pure JSX string builder
// ===========================================================================

describe("toastConfig.snippet: import line", () => {
  it("includes 'import { Toast }' from the correct path", () => {
    const out = snippet({ state: "visible" });
    expect(out).toContain("import { Toast }");
    expect(out).toContain('from "@/components/remocn/toast"');
  });
});

describe("toastConfig.snippet: structural invariants", () => {
  it("contains a <Toast JSX element", () => {
    expect(snippet({ state: "visible" })).toContain("<Toast");
  });

  it("ends with a self-closing />", () => {
    expect(snippet({ state: "visible" }).trimEnd().endsWith("/>")).toBe(true);
  });

  it("state prop is always emitted", () => {
    expect(snippet({ state: "visible" })).toContain('state="visible"');
    expect(snippet({ state: "hidden" })).toContain('state="hidden"');
  });
});

describe("toastConfig.snippet: title is always emitted", () => {
  // title is required on <Toast> so the snippet always includes it — even for
  // the default value (unlike optional props in other components).
  it("emits title='Changes saved' when title is the default", () => {
    const out = snippet({ state: "visible", title: "Changes saved" });
    expect(out).toContain('title="Changes saved"');
  });

  it("emits title prop when title is omitted from values (falls back to default)", () => {
    const out = snippet({ state: "visible" });
    expect(out).toContain('title="Changes saved"');
  });

  it("emits a non-default title when provided", () => {
    const out = snippet({ state: "visible", title: "Upload complete" });
    expect(out).toContain('title="Upload complete"');
  });
});

describe("toastConfig.snippet: default props are omitted", () => {
  // Defaults: variant=success (the config default), mode=light
  // description is omitted when equal to the default string

  it("omits variant when it equals the default 'success'", () => {
    const out = snippet({ state: "visible", variant: "success" });
    expect(out).not.toContain("variant=");
  });

  it("omits mode when it equals the default 'light'", () => {
    const out = snippet({ state: "visible", mode: "light" });
    expect(out).not.toContain("mode=");
  });

  it("omits description when it equals the default description", () => {
    const out = snippet({
      state: "visible",
      description: "Your profile has been updated.",
    });
    expect(out).not.toContain("description=");
  });
});

describe("toastConfig.snippet: non-default props are emitted", () => {
  it("emits variant='default' when non-default (not success)", () => {
    expect(snippet({ state: "visible", variant: "default" })).toContain(
      'variant="default"',
    );
  });

  it("emits variant='error' when non-default", () => {
    expect(snippet({ state: "visible", variant: "error" })).toContain(
      'variant="error"',
    );
  });

  it("emits mode='dark' when non-default", () => {
    expect(snippet({ state: "visible", mode: "dark" })).toContain(
      'mode="dark"',
    );
  });

  it("emits description when non-default", () => {
    expect(
      snippet({ state: "visible", description: "File uploaded." }),
    ).toContain('description="File uploaded."');
  });
});

describe("toastConfig.snippet: state options round-trip", () => {
  it("emits the correct state for every control option", () => {
    const ctrl = toastConfig.controls.state;
    if (ctrl.type !== "select") throw new Error("expected select");
    for (const state of ctrl.options) {
      expect(snippet({ state })).toContain(`state="${state}"`);
    }
  });
});
