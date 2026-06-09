/**
 * Verification tests for the PURE / DETERMINISTIC parts of `dropdown-menu`.
 *
 * Scope:
 *   - registry/remocn-ui/dropdown-menu/index.tsx  — DropdownMenuState union
 *     membership, dropdownMenuStyle presets, dropdownMenuStyleContext
 *   - registry/remocn-ui/dropdown-menu/config.ts  — dropdownMenuConfig.controls
 *     wiring + .snippet output (the state → JSX codegen)
 *   - registry/remocn-ui/dropdown-menu/use-dropdown-menu-transition.ts
 *     — tweenDropdownMenuStyle interpolation, DEFAULT_DURATION
 *
 * The render path (index.tsx) is a PURE-STATE model: `(state) => visual`.
 * `<DropdownMenu>` reads `useRemocnTheme()` internally — that hook is pure at
 * call-time in test context, but the JSX render tree is not exercised here.
 * The pure-testable surface is: the style presets + tween + customizer wiring
 * + snippet codegen.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/dropdown-menu/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * `config.ts` imports `DropdownMenuState` from `@/registry/remocn-ui/dropdown-menu`
 * and the pieces under test never CALL a Remotion runtime API at import time —
 * `dropdownMenuConfig` is a plain object; `.snippet` is a pure string builder;
 * `dropdownMenuStyle` and `tweenDropdownMenuStyle` are pure value functions.
 * We import via RELATIVE paths (matching the existing test suite pattern),
 * annotating each import with the source it corresponds to.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  type DropdownMenuState,
  dropdownMenuStyle,
  dropdownMenuStyleContext,
} from "../index";
import { tweenDropdownMenuStyle, DEFAULT_DURATION } from "../use-dropdown-menu-transition";
import { dropdownMenuConfig } from "../config";
import { defaultLightTheme } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/**
 * The DropdownMenuState union, enumerated as a runtime list for membership checks.
 * Must stay in sync with `export type DropdownMenuState` in index.tsx.
 */
const VALID_STATES: readonly DropdownMenuState[] = ["opened", "closed"];

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  state?: string;
  label?: string;
  highlightedIndex?: number;
  mode?: string;
};

const snippet = (values: SnippetValues): string =>
  dropdownMenuConfig.snippet(values as Record<string, unknown>);

/**
 * A shared DropdownMenuStyleContext built from the default light theme.
 * `dropdownMenuStyleContext` takes only `(theme)` — no variant arg.
 */
const ctx = dropdownMenuStyleContext(defaultLightTheme);

// ===========================================================================
// 1. DropdownMenuState union membership
// ===========================================================================

describe("DropdownMenuState union", () => {
  it("contains exactly the two documented states", () => {
    const control = dropdownMenuConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["opened", "closed"]);
  });

  it("every VALID_STATES entry is assignable (no typos in the fixture)", () => {
    const control = dropdownMenuConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(VALID_STATES).toHaveLength(2);
    for (const s of VALID_STATES) {
      expect(control.options).toContain(s);
    }
  });
});

// ===========================================================================
// 2. dropdownMenuConfig.controls.state — customizer control wiring
// ===========================================================================

describe("dropdownMenuConfig.controls.state", () => {
  it("is a select control", () => {
    expect(dropdownMenuConfig.controls.state.type).toBe("select");
  });

  it("has exactly the two DropdownMenuState options in order", () => {
    const control = dropdownMenuConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["opened", "closed"]);
  });

  it("defaults to 'opened' so the preview shows the panel", () => {
    const control = dropdownMenuConfig.controls.state;
    expect(control.default).toBe("opened");
  });

  it("every option is a member of the DropdownMenuState union", () => {
    const control = dropdownMenuConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const option of control.options) {
      expect(VALID_STATES).toContain(option as DropdownMenuState);
    }
  });
});

// ===========================================================================
// 3. dropdownMenuConfig.snippet — pure string builder
//    State model: snippet ALWAYS emits `state="<state>"` as a bare JSX prop.
// ===========================================================================

describe("dropdownMenuConfig.snippet: state prop emission", () => {
  it("emits state=\"opened\" for the opened option", () => {
    expect(snippet({ state: "opened" })).toContain('state="opened"');
  });

  it("emits state=\"closed\" for the closed option", () => {
    expect(snippet({ state: "closed" })).toContain('state="closed"');
  });

  it("emits the correct state for every control option", () => {
    const control = dropdownMenuConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const state of control.options) {
      const out = snippet({ state });
      expect(out).toContain(`state="${state}"`);
    }
  });
});

describe("dropdownMenuConfig.snippet: import line", () => {
  it("includes `import { DropdownMenu }` from the correct path", () => {
    const out = snippet({ state: "opened" });
    expect(out).toContain('import { DropdownMenu }');
    expect(out).toContain('from "@/components/remocn/dropdown-menu"');
  });
});

describe("dropdownMenuConfig.snippet: default props are omitted", () => {
  // Defaults: label="Options", highlightedIndex=-1, mode="light"
  // Note: config default for highlightedIndex is 0, but the omit condition is !== -1,
  // so highlightedIndex=0 IS emitted. We test the -1 case here (the condition boundary).
  const allDefaults = snippet({
    state: "opened",
    label: "Options",
    highlightedIndex: -1,
    mode: "light",
  });

  it("omits label when it equals the default 'Options'", () => {
    expect(allDefaults).not.toContain("label=");
  });

  it("omits highlightedIndex when it equals -1", () => {
    expect(allDefaults).not.toContain("highlightedIndex=");
  });

  it("omits mode when it equals the default 'light'", () => {
    expect(allDefaults).not.toContain("mode=");
  });
});

describe("dropdownMenuConfig.snippet: non-default props are emitted", () => {
  it("emits a non-default label", () => {
    expect(snippet({ state: "opened", label: "Account" }))
      .toContain('label="Account"');
  });

  it("emits a non-default highlightedIndex (0 is non-default, condition is !== -1)", () => {
    expect(snippet({ state: "opened", highlightedIndex: 0 }))
      .toContain("highlightedIndex={0}");
  });

  it("emits a non-default mode", () => {
    expect(snippet({ state: "opened", mode: "dark" }))
      .toContain('mode="dark"');
  });
});

describe("dropdownMenuConfig.snippet: structural round-trip", () => {
  const out = snippet({ state: "opened" });

  it("starts with the import line", () => {
    expect(out.startsWith('import { DropdownMenu }')).toBe(true);
  });

  it("contains a <DropdownMenu JSX opening", () => {
    expect(out).toContain("<DropdownMenu");
  });

  it("ends with a self-closing />", () => {
    expect(out.trimEnd().endsWith("/>")).toBe(true);
  });
});

// ===========================================================================
// 4. dropdownMenuStyleContext — derives concrete colors from the theme.
//    Signature is `(theme)` — NO variant argument.
//    Build ctx from the default light theme and assert each field is populated.
//    `radius` is a number; all other non-nested fields are non-empty strings.
// ===========================================================================

describe("dropdownMenuStyleContext: field types from defaultLightTheme", () => {
  it("panelBg is a non-empty string", () => {
    expect(typeof ctx.panelBg).toBe("string");
    expect(ctx.panelBg.length).toBeGreaterThan(0);
  });

  it("panelBorder is a non-empty string", () => {
    expect(typeof ctx.panelBorder).toBe("string");
    expect(ctx.panelBorder.length).toBeGreaterThan(0);
  });

  it("triggerFg is a non-empty string", () => {
    expect(typeof ctx.triggerFg).toBe("string");
    expect(ctx.triggerFg.length).toBeGreaterThan(0);
  });

  it("mutedFg is a non-empty string", () => {
    expect(typeof ctx.mutedFg).toBe("string");
    expect(ctx.mutedFg.length).toBeGreaterThan(0);
  });

  it("radius is a number", () => {
    expect(typeof ctx.radius).toBe("number");
  });

  it("triggerCtx is a non-null object (ButtonStyleContext)", () => {
    expect(typeof ctx.triggerCtx).toBe("object");
    expect(ctx.triggerCtx).not.toBeNull();
  });

  it("itemCtx is a non-null object (DropdownMenuItemStyleContext)", () => {
    expect(typeof ctx.itemCtx).toBe("object");
    expect(ctx.itemCtx).not.toBeNull();
  });
});

describe("dropdownMenuStyleContext: maps theme tokens correctly", () => {
  it("panelBg equals theme.popover", () => {
    expect(ctx.panelBg).toBe(defaultLightTheme.popover);
  });

  it("panelBorder equals theme.border", () => {
    expect(ctx.panelBorder).toBe(defaultLightTheme.border);
  });

  it("triggerFg equals theme.foreground", () => {
    expect(ctx.triggerFg).toBe(defaultLightTheme.foreground);
  });

  it("mutedFg equals theme.mutedForeground", () => {
    expect(ctx.mutedFg).toBe(defaultLightTheme.mutedForeground);
  });

  it("radius equals theme.radius", () => {
    expect(ctx.radius).toBe(defaultLightTheme.radius);
  });
});

// ===========================================================================
// 5. dropdownMenuStyle presets — pure (state, ctx) => DropdownMenuStyle
//    All four fields are numeric. Assert per-state invariants:
//    opened → { panelOpacity:1, panelScale:1, panelTranslateY:0, chevronRotation:180 }
//    closed → { panelOpacity:0, panelScale:0.96, panelTranslateY:-4, chevronRotation:0 }
// ===========================================================================

describe("dropdownMenuStyle: opened state", () => {
  const s = dropdownMenuStyle("opened", ctx);

  it("panelOpacity is 1 (panel fully visible)", () => {
    expect(s.panelOpacity).toBe(1);
  });

  it("panelScale is 1 (panel at full size)", () => {
    expect(s.panelScale).toBe(1);
  });

  it("panelTranslateY is 0 (panel at natural position)", () => {
    expect(s.panelTranslateY).toBe(0);
  });

  it("chevronRotation is 180 (chevron flipped)", () => {
    expect(s.chevronRotation).toBe(180);
  });
});

describe("dropdownMenuStyle: closed state", () => {
  const s = dropdownMenuStyle("closed", ctx);

  it("panelOpacity is 0 (panel fully hidden)", () => {
    expect(s.panelOpacity).toBe(0);
  });

  it("panelScale is 0.96 (panel slightly shrunk)", () => {
    expect(s.panelScale).toBe(0.96);
  });

  it("panelTranslateY is -4 (panel lifted -4px)", () => {
    expect(s.panelTranslateY).toBe(-4);
  });

  it("chevronRotation is 0 (chevron pointing down)", () => {
    expect(s.chevronRotation).toBe(0);
  });
});

describe("dropdownMenuStyle: closed/opened invariant", () => {
  it("closed: panelOpacity=0, panelScale=0.96, panelTranslateY=-4, chevronRotation=0", () => {
    const s = dropdownMenuStyle("closed", ctx);
    expect(s.panelOpacity).toBe(0);
    expect(s.panelScale).toBe(0.96);
    expect(s.panelTranslateY).toBe(-4);
    expect(s.chevronRotation).toBe(0);
  });

  it("opened: panelOpacity=1, panelScale=1, panelTranslateY=0, chevronRotation=180", () => {
    const s = dropdownMenuStyle("opened", ctx);
    expect(s.panelOpacity).toBe(1);
    expect(s.panelScale).toBe(1);
    expect(s.panelTranslateY).toBe(0);
    expect(s.chevronRotation).toBe(180);
  });
});

// ===========================================================================
// 6. tweenDropdownMenuStyle — pure linear interpolation between two
//    DropdownMenuStyles. All four fields are pure numeric lerps.
//    Concrete expectations: closed → opened for midpoint math.
// ===========================================================================

describe("tweenDropdownMenuStyle: t=0 returns values equal to `a`", () => {
  const a = dropdownMenuStyle("closed", ctx);
  const b = dropdownMenuStyle("opened", ctx);
  const r = tweenDropdownMenuStyle(a, b, 0);

  it("panelOpacity equals a.panelOpacity at t=0", () => {
    expect(r.panelOpacity).toBeCloseTo(a.panelOpacity, 10);
  });

  it("panelScale equals a.panelScale at t=0", () => {
    expect(r.panelScale).toBeCloseTo(a.panelScale, 10);
  });

  it("panelTranslateY equals a.panelTranslateY at t=0", () => {
    expect(r.panelTranslateY).toBeCloseTo(a.panelTranslateY, 10);
  });

  it("chevronRotation equals a.chevronRotation at t=0", () => {
    expect(r.chevronRotation).toBeCloseTo(a.chevronRotation, 10);
  });
});

describe("tweenDropdownMenuStyle: t=1 returns values equal to `b`", () => {
  const a = dropdownMenuStyle("closed", ctx);
  const b = dropdownMenuStyle("opened", ctx);
  const r = tweenDropdownMenuStyle(a, b, 1);

  it("panelOpacity equals b.panelOpacity at t=1", () => {
    expect(r.panelOpacity).toBeCloseTo(b.panelOpacity, 10);
  });

  it("panelScale equals b.panelScale at t=1", () => {
    expect(r.panelScale).toBeCloseTo(b.panelScale, 10);
  });

  it("panelTranslateY equals b.panelTranslateY at t=1", () => {
    expect(r.panelTranslateY).toBeCloseTo(b.panelTranslateY, 10);
  });

  it("chevronRotation equals b.chevronRotation at t=1", () => {
    expect(r.chevronRotation).toBeCloseTo(b.chevronRotation, 10);
  });
});

describe("tweenDropdownMenuStyle: t=0.5 midpoint numeric lerp (closed → opened)", () => {
  // closed: panelOpacity=0, panelScale=0.96, panelTranslateY=-4, chevronRotation=0
  // opened: panelOpacity=1, panelScale=1,    panelTranslateY=0,  chevronRotation=180
  const a = dropdownMenuStyle("closed", ctx);
  const b = dropdownMenuStyle("opened", ctx);
  const r = tweenDropdownMenuStyle(a, b, 0.5);

  it("panelOpacity midpoint: 0 → 1 gives 0.5", () => {
    expect(r.panelOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelScale midpoint: 0.96 → 1 gives 0.98", () => {
    expect(r.panelScale).toBeCloseTo(0.98, 10);
  });

  it("panelTranslateY midpoint: -4 → 0 gives -2", () => {
    expect(r.panelTranslateY).toBeCloseTo(-2, 10);
  });

  it("chevronRotation midpoint: 0 → 180 gives 90", () => {
    expect(r.chevronRotation).toBeCloseTo(90, 10);
  });
});

describe("tweenDropdownMenuStyle: t=0.5 midpoint numeric lerp (opened → closed)", () => {
  // opened: panelOpacity=1, panelScale=1,    panelTranslateY=0,  chevronRotation=180
  // closed: panelOpacity=0, panelScale=0.96, panelTranslateY=-4, chevronRotation=0
  const a = dropdownMenuStyle("opened", ctx);
  const b = dropdownMenuStyle("closed", ctx);
  const r = tweenDropdownMenuStyle(a, b, 0.5);

  it("panelOpacity midpoint: 1 → 0 gives 0.5", () => {
    expect(r.panelOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelScale midpoint: 1 → 0.96 gives 0.98", () => {
    expect(r.panelScale).toBeCloseTo(0.98, 10);
  });

  it("panelTranslateY midpoint: 0 → -4 gives -2", () => {
    expect(r.panelTranslateY).toBeCloseTo(-2, 10);
  });

  it("chevronRotation midpoint: 180 → 0 gives 90", () => {
    expect(r.chevronRotation).toBeCloseTo(90, 10);
  });
});

// ===========================================================================
// 7. DEFAULT_DURATION — sanity check the exported constant
// ===========================================================================

describe("DEFAULT_DURATION", () => {
  it("is a positive number", () => {
    expect(typeof DEFAULT_DURATION).toBe("number");
    expect(DEFAULT_DURATION).toBeGreaterThan(0);
  });

  it("equals 12 (container default — longer than item's 8)", () => {
    expect(DEFAULT_DURATION).toBe(12);
  });
});
