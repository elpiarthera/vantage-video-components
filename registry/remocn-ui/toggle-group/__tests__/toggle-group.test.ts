/**
 * Verification tests for the PURE / DETERMINISTIC parts of `toggle-group`.
 *
 * Scope:
 *   - registry/remocn-ui/toggle-group/index.tsx  — ToggleGroupState type,
 *     toggleGroupStyle presets, toggleGroupStyleContext
 *   - registry/remocn-ui/toggle-group/use-toggle-group-transition.ts
 *     — tweenToggleGroupStyle interpolation, DEFAULT_DURATION,
 *       pure replica of useToggleGroupTransition
 *   - registry/remocn-ui/toggle-group/config.ts  — toggleGroupConfig.controls
 *     wiring + toggleGroupConfig.snippet output (the state → JSX codegen)
 *
 * The render path (index.tsx) is a PURE-STATE model: `(style) => visual`.
 * `<ToggleGroup>` reads `useRemocnTheme()` internally — that hook is pure at
 * call-time in test context, but the JSX render tree is not exercised here.
 * The pure-testable surface is: the style presets + context builder + tween +
 * customizer wiring + snippet codegen.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/toggle-group/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * All imports use RELATIVE paths matching the existing test suite pattern.
 * `config.ts` imports `ToggleGroupState` from the toggle-group registry path;
 * none of the pieces under test call a Remotion runtime API at import time —
 * `toggleGroupConfig` is a plain object; `.snippet` is a pure string builder;
 * `toggleGroupStyle` and `tweenToggleGroupStyle` are pure value functions.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  type ToggleGroupState,
  type ToggleGroupItem,
  toggleGroupStyle,
  toggleGroupStyleContext,
} from "../index";
import {
  tweenToggleGroupStyle,
  DEFAULT_DURATION,
} from "../use-toggle-group-transition";
import { toggleGroupConfig } from "../config";
import { defaultLightTheme } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/**
 * The canonical two-item list — mirrors DEFAULT_ITEMS in index.tsx and the
 * config.controls.state.options list. Must stay in sync.
 */
const DEFAULT_ITEMS: ToggleGroupItem[] = [
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  state?: string;
  size?: string;
  mode?: string;
};

const snippet = (values: SnippetValues): string =>
  toggleGroupConfig.snippet(values as Record<string, unknown>);

/**
 * A shared ToggleGroupStyleContext built from the default items + default
 * light theme. Mirrors how the component builds its own context internally.
 * Note: toggleGroupStyleContext takes (items, theme) — no variant argument.
 */
const ctx = toggleGroupStyleContext(DEFAULT_ITEMS, defaultLightTheme);

// ===========================================================================
// 1. DEFAULT_DURATION — sanity check the exported constant
// ===========================================================================

describe("DEFAULT_DURATION", () => {
  it("is a positive number", () => {
    expect(typeof DEFAULT_DURATION).toBe("number");
    expect(DEFAULT_DURATION).toBeGreaterThan(0);
  });

  it("equals 14 (the authored value)", () => {
    expect(DEFAULT_DURATION).toBe(14);
  });
});

// ===========================================================================
// 2. toggleGroupStyleContext — token mapping and round-trips
//    The context is pure: (items, theme) => ToggleGroupStyleContext.
//    Token map: trackBg=muted, thumbBg=background, activeFg=foreground,
//               inactiveFg=mutedForeground, radius=radius.
// ===========================================================================

describe("toggleGroupStyleContext: token mapping (light theme)", () => {
  it("trackBg equals theme.muted", () => {
    expect(ctx.trackBg).toBe(defaultLightTheme.muted);
  });

  it("thumbBg equals theme.background", () => {
    expect(ctx.thumbBg).toBe(defaultLightTheme.background);
  });

  it("activeFg equals theme.foreground", () => {
    expect(ctx.activeFg).toBe(defaultLightTheme.foreground);
  });

  it("inactiveFg equals theme.mutedForeground", () => {
    expect(ctx.inactiveFg).toBe(defaultLightTheme.mutedForeground);
  });

  it("radius equals theme.radius", () => {
    expect(ctx.radius).toBe(defaultLightTheme.radius);
  });
});

describe("toggleGroupStyleContext: items round-trip", () => {
  it("ctx.items is the same array reference passed in", () => {
    expect(ctx.items).toBe(DEFAULT_ITEMS);
  });

  it("ctx.items has the expected length", () => {
    expect(ctx.items).toHaveLength(2);
  });

  it("ctx.items[0].value is 'Monthly'", () => {
    expect(ctx.items[0].value).toBe("Monthly");
  });

  it("ctx.items[1].value is 'Yearly'", () => {
    expect(ctx.items[1].value).toBe("Yearly");
  });
});

describe("toggleGroupStyleContext: light and dark produce independent token sets", () => {
  it("a dark-mode theme produces a different trackBg than the light theme", () => {
    // Build a minimal dark theme by overriding the key tokens
    const darkTheme = {
      ...defaultLightTheme,
      muted: "hsl(217 33% 17%)",
      background: "hsl(222 47% 11%)",
      foreground: "hsl(213 31% 91%)",
      mutedForeground: "hsl(215 20% 65%)",
    };
    const darkCtx = toggleGroupStyleContext(DEFAULT_ITEMS, darkTheme);
    // trackBg maps to muted, which we overrode
    expect(darkCtx.trackBg).not.toBe(ctx.trackBg);
  });
});

// ===========================================================================
// 3. toggleGroupStyle presets — pure (state, ctx) => ToggleGroupStyle
//    indicatorOffset is the ONLY field.
//    Monthly → 0 (index 0), Yearly → 1 (index 1), unknown → 0 (safe fallback).
// ===========================================================================

describe("toggleGroupStyle: Monthly state", () => {
  it("indicatorOffset is 0 (first item, index 0)", () => {
    expect(toggleGroupStyle("Monthly", ctx).indicatorOffset).toBe(0);
  });
});

describe("toggleGroupStyle: Yearly state", () => {
  it("indicatorOffset is 1 (second item, index 1)", () => {
    expect(toggleGroupStyle("Yearly", ctx).indicatorOffset).toBe(1);
  });
});

describe("toggleGroupStyle: unknown state", () => {
  it("returns indicatorOffset 0 as the safe fallback for an unknown state", () => {
    expect(toggleGroupStyle("Unknown", ctx).indicatorOffset).toBe(0);
  });

  it("returns indicatorOffset 0 for an empty-string state", () => {
    expect(toggleGroupStyle("", ctx).indicatorOffset).toBe(0);
  });
});

describe("toggleGroupStyle: each default item maps to its own index", () => {
  const items: ToggleGroupItem[] = [
    { value: "Monthly", label: "Monthly" },
    { value: "Yearly", label: "Yearly" },
  ];
  const twoCtx = toggleGroupStyleContext(items, defaultLightTheme);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    it(`${item.value} → indicatorOffset ${i}`, () => {
      expect(toggleGroupStyle(item.value, twoCtx).indicatorOffset).toBe(i);
    });
  }
});

describe("toggleGroupStyle: 3-item list index round-trip", () => {
  const threeItems: ToggleGroupItem[] = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
  ];
  const threeCtx = toggleGroupStyleContext(threeItems, defaultLightTheme);

  it("A → indicatorOffset 0", () => {
    expect(toggleGroupStyle("A", threeCtx).indicatorOffset).toBe(0);
  });

  it("B → indicatorOffset 1", () => {
    expect(toggleGroupStyle("B", threeCtx).indicatorOffset).toBe(1);
  });

  it("C → indicatorOffset 2", () => {
    expect(toggleGroupStyle("C", threeCtx).indicatorOffset).toBe(2);
  });

  it("unknown state returns 0 in a 3-item context", () => {
    expect(toggleGroupStyle("D", threeCtx).indicatorOffset).toBe(0);
  });
});

// ===========================================================================
// 4. tweenToggleGroupStyle — pure linear interpolation between two styles.
//    indicatorOffset is the ONLY field; it lerps linearly.
//    a={indicatorOffset:0} (Monthly), b={indicatorOffset:1} (Yearly).
// ===========================================================================

describe("tweenToggleGroupStyle: t=0 returns values equal to a", () => {
  const a = toggleGroupStyle("Monthly", ctx); // indicatorOffset: 0
  const b = toggleGroupStyle("Yearly", ctx);  // indicatorOffset: 1
  const r = tweenToggleGroupStyle(a, b, 0);

  it("indicatorOffset equals a.indicatorOffset at t=0", () => {
    expect(r.indicatorOffset).toBeCloseTo(0, 10);
  });
});

describe("tweenToggleGroupStyle: t=1 returns values equal to b", () => {
  const a = toggleGroupStyle("Monthly", ctx); // indicatorOffset: 0
  const b = toggleGroupStyle("Yearly", ctx);  // indicatorOffset: 1
  const r = tweenToggleGroupStyle(a, b, 1);

  it("indicatorOffset equals b.indicatorOffset at t=1", () => {
    expect(r.indicatorOffset).toBeCloseTo(1, 10);
  });
});

describe("tweenToggleGroupStyle: t=0.5 midpoint (Monthly → Yearly)", () => {
  // Monthly: indicatorOffset=0, Yearly: indicatorOffset=1
  // Midpoint: 0 + (1-0)*0.5 = 0.5
  const a = toggleGroupStyle("Monthly", ctx);
  const b = toggleGroupStyle("Yearly", ctx);
  const r = tweenToggleGroupStyle(a, b, 0.5);

  it("indicatorOffset midpoint: 0 → 1 gives 0.5", () => {
    expect(r.indicatorOffset).toBeCloseTo(0.5, 10);
  });
});

describe("tweenToggleGroupStyle: t=0.5 midpoint (Yearly → Monthly, reverse)", () => {
  // Yearly: indicatorOffset=1, Monthly: indicatorOffset=0
  // Midpoint: 1 + (0-1)*0.5 = 0.5
  const a = toggleGroupStyle("Yearly", ctx);
  const b = toggleGroupStyle("Monthly", ctx);
  const r = tweenToggleGroupStyle(a, b, 0.5);

  it("indicatorOffset midpoint: 1 → 0 gives 0.5", () => {
    expect(r.indicatorOffset).toBeCloseTo(0.5, 10);
  });
});

describe("tweenToggleGroupStyle: identity (a === b)", () => {
  const a = toggleGroupStyle("Monthly", ctx);
  const r = tweenToggleGroupStyle(a, a, 0.5);

  it("indicatorOffset is unchanged when tweening a style to itself", () => {
    expect(r.indicatorOffset).toBeCloseTo(a.indicatorOffset, 10);
  });
});

describe("tweenToggleGroupStyle: t=0.25 quarter-way", () => {
  // a=0, b=1, t=0.25 → 0.25
  const a = toggleGroupStyle("Monthly", ctx);
  const b = toggleGroupStyle("Yearly", ctx);
  const r = tweenToggleGroupStyle(a, b, 0.25);

  it("indicatorOffset quarter-way: 0 → 1 gives 0.25", () => {
    expect(r.indicatorOffset).toBeCloseTo(0.25, 10);
  });
});

// ===========================================================================
// 5. resolveToggleGroupTransition — pure replica of useToggleGroupTransition
//
//    useToggleGroupTransition is impure (calls useRemocnTheme + useStateTransition).
//    We mirror its logic as a pure function with `frame` injected as `raw`,
//    then assert the easing contract: easings.out(t) = 1-(1-t)^3.
//
//    The replica mirrors lines 57–82 of use-toggle-group-transition.ts.
//    Default state is items[0].value = "Monthly".
// ===========================================================================

/**
 * Pure replica of useToggleGroupTransition for testing.
 *
 * Mirrors the impure hook with `frame` injected as `raw` so we can test the
 * easing contract without a Remotion render context.
 *
 * Annotated lines match the source in use-toggle-group-transition.ts:
 */
function resolveToggleGroupTransition(
  steps: Array<{ from: number; state: ToggleGroupState; duration?: number }>,
  frame: number, // injected as `raw` — mirrors useCurrentFrame() in the real hook
  items: ToggleGroupItem[] = DEFAULT_ITEMS,
  speed: number = 1,
  defaultDuration: number = DEFAULT_DURATION,
) {
  const localCtx = toggleGroupStyleContext(items, defaultLightTheme); // mirrors line 69
  const defaultState: ToggleGroupState = items[0].value;              // mirrors line 73

  // Mirror the step-fold logic from useStateTransition:
  // find the two enclosing steps and compute raw linear progress [0,1].
  let from: ToggleGroupState = defaultState;
  let to: ToggleGroupState = defaultState;
  let progress = 0;

  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const stepStart = step.from;
    const stepDuration = (step.duration ?? defaultDuration) / speed;
    const stepEnd = stepStart + stepDuration;
    const next = steps[si + 1];

    if (frame < stepStart) {
      // Before this step — stay at default (or previous state already set)
      break;
    }

    if (frame >= stepStart) {
      from = step.state;
      to = next?.state ?? step.state;

      if (frame >= stepEnd || !next) {
        // Past this window — snap to end state, progress = 1
        from = next?.state ?? step.state;
        to = from;
        progress = 0;
      } else {
        // Inside the transition window
        progress = (frame - stepStart) / stepDuration;
      }
    }
  }

  // mirrors line 76: const t = easings.out(progress)
  const t = 1 - (1 - progress) ** 3;
  // mirrors lines 77-81: tweenToggleGroupStyle(toggleGroupStyle(from, ctx), toggleGroupStyle(to, ctx), t)
  return tweenToggleGroupStyle(
    toggleGroupStyle(from, localCtx),
    toggleGroupStyle(to, localCtx),
    t,
  );
}

describe("resolveToggleGroupTransition: before first step", () => {
  // At frame 0, before any step at frame=10 fires — default state "Monthly"
  const steps = [{ from: 10, state: "Yearly" as ToggleGroupState }];
  const r = resolveToggleGroupTransition(steps, 0);

  it("holds at Monthly (indicatorOffset=0) before first step fires", () => {
    expect(r.indicatorOffset).toBeCloseTo(0, 10);
  });
});

describe("resolveToggleGroupTransition: at boundary (progress=0, t=0)", () => {
  // At frame=10 exactly, progress=0 → easings.out(0) = 0 → still at Monthly
  const steps = [{ from: 10, state: "Yearly" as ToggleGroupState, duration: 14 }];
  const r = resolveToggleGroupTransition(steps, 10);

  it("indicatorOffset is 0 at the step boundary (progress=0, eased=0)", () => {
    expect(r.indicatorOffset).toBeCloseTo(0, 5);
  });
});

describe("resolveToggleGroupTransition: mid-window eased (frame 7 of 14)", () => {
  // Steps: Monthly at t=0, Yearly at t=0 with duration=14.
  // Frame=7 of a 14-frame window → progress=7/14=0.5
  // easings.out(0.5) = 1-(1-0.5)^3 = 1-0.125 = 0.875
  // tween({indicatorOffset:0}, {indicatorOffset:1}, 0.875) → indicatorOffset=0.875
  const steps = [
    { from: 0, state: "Monthly" as ToggleGroupState, duration: 14 },
    { from: 14, state: "Yearly" as ToggleGroupState },
  ];
  const r = resolveToggleGroupTransition(steps, 7);

  it("indicatorOffset at frame 7 is 0.875 (cubic ease-out applied)", () => {
    expect(r.indicatorOffset).toBeCloseTo(0.875, 5);
  });
});

describe("resolveToggleGroupTransition: past window snaps to target state", () => {
  // Past the 14-frame window from Monthly→Yearly, should be fully at Yearly
  const steps = [
    { from: 0, state: "Monthly" as ToggleGroupState, duration: 14 },
    { from: 14, state: "Yearly" as ToggleGroupState },
  ];
  const r = resolveToggleGroupTransition(steps, 30);

  it("indicatorOffset is 1 (Yearly) after transition completes", () => {
    expect(r.indicatorOffset).toBeCloseTo(1, 5);
  });
});

describe("resolveToggleGroupTransition: speed contract", () => {
  // Speed=2 halves the effective duration: 14/2=7 frames to complete.
  // At frame=3.5 (half of 7-frame window), progress=0.5, eased=0.875.
  const steps = [
    { from: 0, state: "Monthly" as ToggleGroupState, duration: 14 },
    { from: 7, state: "Yearly" as ToggleGroupState },
  ];
  const r = resolveToggleGroupTransition(steps, 3, /* items */ DEFAULT_ITEMS, /* speed */ 2);

  it("speed=2 accelerates transition: indicatorOffset is closer to 1 at frame 3", () => {
    // At frame 3 with speed=2, progress=3/7≈0.4286, eased≈0.73
    // Without speed=2 at frame 3 of 14: progress=3/14≈0.214, eased≈0.57
    // So the eased value should be greater with speed=2
    expect(r.indicatorOffset).toBeGreaterThan(0.6);
  });
});

// ===========================================================================
// 6. toggleGroupConfig.controls — customizer control wiring
// ===========================================================================

describe("toggleGroupConfig.controls.state", () => {
  it("is a select control", () => {
    expect(toggleGroupConfig.controls.state.type).toBe("select");
  });

  it("defaults to 'Monthly' so the preview opens on the first segment", () => {
    expect(toggleGroupConfig.controls.state.default).toBe("Monthly");
  });

  it("has exactly the two documented state options in order", () => {
    const control = toggleGroupConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["Monthly", "Yearly"]);
  });
});

describe("toggleGroupConfig.controls.size", () => {
  it("is a select control", () => {
    expect(toggleGroupConfig.controls.size.type).toBe("select");
  });

  it("defaults to 'default'", () => {
    expect(toggleGroupConfig.controls.size.default).toBe("default");
  });

  it("has exactly the two size options in order", () => {
    const control = toggleGroupConfig.controls.size;
    if (control.type !== "select") throw new Error("size control must be a select");
    expect(control.options).toEqual(["default", "sm"]);
  });
});

describe("toggleGroupConfig.controls.mode", () => {
  it("is a select control", () => {
    expect(toggleGroupConfig.controls.mode.type).toBe("select");
  });

  it("defaults to 'light'", () => {
    expect(toggleGroupConfig.controls.mode.default).toBe("light");
  });

  it("has exactly the two mode options in order", () => {
    const control = toggleGroupConfig.controls.mode;
    if (control.type !== "select") throw new Error("mode control must be a select");
    expect(control.options).toEqual(["light", "dark"]);
  });
});

// ===========================================================================
// 7. toggleGroupConfig.snippet — pure string builder
//
//    Invariant: state is ALWAYS emitted.
//    Invariant: items inline literal is ALWAYS emitted (regardless of values).
//    Default omission: size omitted when "default"; mode omitted when "light".
//    Non-default emission: size emitted when "sm"; mode emitted when "dark".
// ===========================================================================

describe("toggleGroupConfig.snippet: import line", () => {
  it("includes `import { ToggleGroup }` from the correct path", () => {
    const out = snippet({ state: "Monthly" });
    expect(out).toContain("import { ToggleGroup }");
    expect(out).toContain('from "@/components/remocn/toggle-group"');
  });
});

describe("toggleGroupConfig.snippet: state prop always emitted", () => {
  it("emits state=\"Monthly\" for the Monthly option", () => {
    expect(snippet({ state: "Monthly" })).toContain('state="Monthly"');
  });

  it("emits state=\"Yearly\" for the Yearly option", () => {
    expect(snippet({ state: "Yearly" })).toContain('state="Yearly"');
  });

  it("emits the correct state for every control option", () => {
    const control = toggleGroupConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const state of control.options) {
      expect(snippet({ state })).toContain(`state="${state}"`);
    }
  });
});

describe("toggleGroupConfig.snippet: items inline literal always emitted", () => {
  it("always emits the items JSX array regardless of state", () => {
    for (const state of ["Monthly", "Yearly"]) {
      const out = snippet({ state });
      expect(out).toContain("items={[");
      expect(out).toContain('{ value: "Monthly", label: "Monthly" }');
      expect(out).toContain('{ value: "Yearly", label: "Yearly" }');
    }
  });

  it("emits items even when all defaults are set", () => {
    const out = snippet({ state: "Monthly", size: "default", mode: "light" });
    expect(out).toContain("items={[");
  });
});

describe("toggleGroupConfig.snippet: default props are omitted", () => {
  const allDefaults = snippet({ state: "Monthly", size: "default", mode: "light" });

  it("omits size when it equals the default 'default'", () => {
    expect(allDefaults).not.toContain("size=");
  });

  it("omits mode when it equals the default 'light'", () => {
    expect(allDefaults).not.toContain("mode=");
  });
});

describe("toggleGroupConfig.snippet: non-default props are emitted", () => {
  it("emits size=\"sm\" when size is non-default", () => {
    expect(snippet({ state: "Monthly", size: "sm" })).toContain('size="sm"');
  });

  it("emits mode=\"dark\" when mode is non-default", () => {
    expect(snippet({ state: "Monthly", mode: "dark" })).toContain('mode="dark"');
  });

  it("emits both size and mode when both are non-default", () => {
    const out = snippet({ state: "Yearly", size: "sm", mode: "dark" });
    expect(out).toContain('size="sm"');
    expect(out).toContain('mode="dark"');
  });
});

describe("toggleGroupConfig.snippet: structural round-trip", () => {
  const out = snippet({ state: "Monthly" });

  it("starts with the import line", () => {
    expect(out.startsWith("import { ToggleGroup }")).toBe(true);
  });

  it("contains a <ToggleGroup JSX opening", () => {
    expect(out).toContain("<ToggleGroup");
  });

  it("ends with a self-closing />", () => {
    expect(out.trimEnd().endsWith("/>")).toBe(true);
  });
});
