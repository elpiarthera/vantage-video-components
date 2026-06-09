/**
 * Verification tests for the PURE / DETERMINISTIC parts of `dropdown-menu-item`.
 *
 * Scope:
 *   - registry/remocn-ui/dropdown-menu-item/index.tsx  — DropdownMenuItemState
 *     union membership, dropdownMenuItemStyle presets, dropdownMenuItemStyleContext
 *   - registry/remocn-ui/dropdown-menu-item/config.ts  — dropdownMenuItemConfig
 *     .controls wiring + .snippet output (the state → JSX codegen)
 *   - registry/remocn-ui/dropdown-menu-item/use-dropdown-menu-item-transition.ts
 *     — tweenDropdownMenuItemStyle interpolation, DEFAULT_DURATION
 *
 * The render path (index.tsx) is a PURE-STATE model: `(state) => visual`.
 * `<DropdownMenuItem>` reads `useRemocnTheme()` internally — that hook is pure
 * at call-time in test context, but the JSX render tree is not exercised here.
 * The pure-testable surface is: the style presets + tween + customizer wiring
 * + snippet codegen.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/dropdown-menu-item/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * `config.ts` imports `DropdownMenuItemState` from
 * `@/registry/remocn-ui/dropdown-menu-item` and the pieces under test never
 * CALL a Remotion runtime API at import time — `dropdownMenuItemConfig` is a
 * plain object; `.snippet` is a pure string builder; `dropdownMenuItemStyle`
 * and `tweenDropdownMenuItemStyle` are pure value functions.
 * We import via RELATIVE paths (matching the existing test suite pattern),
 * annotating each import with the source it corresponds to.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  type DropdownMenuItemState,
  dropdownMenuItemStyle,
  dropdownMenuItemStyleContext,
} from "../index";
import { tweenDropdownMenuItemStyle, DEFAULT_DURATION } from "../use-dropdown-menu-item-transition";
import { dropdownMenuItemConfig } from "../config";
import { defaultLightTheme } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/**
 * The DropdownMenuItemState union, enumerated as a runtime list for membership
 * checks. Must stay in sync with `export type DropdownMenuItemState` in index.tsx.
 */
const VALID_STATES: readonly DropdownMenuItemState[] = ["idle", "hover", "press"];

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  state?: string;
  label?: string;
  mode?: string;
};

const snippet = (values: SnippetValues): string =>
  dropdownMenuItemConfig.snippet(values as Record<string, unknown>);

/**
 * A shared DropdownMenuItemStyleContext built from the default light theme.
 * `dropdownMenuItemStyleContext` takes only `(theme)` — no variant arg.
 */
const ctx = dropdownMenuItemStyleContext(defaultLightTheme);

// ===========================================================================
// 1. DropdownMenuItemState union membership
// ===========================================================================

describe("DropdownMenuItemState union", () => {
  it("contains exactly the three documented states", () => {
    const control = dropdownMenuItemConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["idle", "hover", "press"]);
  });

  it("every VALID_STATES entry is assignable (no typos in the fixture)", () => {
    const control = dropdownMenuItemConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(VALID_STATES).toHaveLength(3);
    for (const s of VALID_STATES) {
      expect(control.options).toContain(s);
    }
  });
});

// ===========================================================================
// 2. dropdownMenuItemConfig.controls.state — customizer control wiring
// ===========================================================================

describe("dropdownMenuItemConfig.controls.state", () => {
  it("is a select control", () => {
    expect(dropdownMenuItemConfig.controls.state.type).toBe("select");
  });

  it("has exactly the three DropdownMenuItemState options in order", () => {
    const control = dropdownMenuItemConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["idle", "hover", "press"]);
  });

  it("defaults to 'hover' so the preview shows the highlighted row", () => {
    const control = dropdownMenuItemConfig.controls.state;
    expect(control.default).toBe("hover");
  });

  it("every option is a member of the DropdownMenuItemState union", () => {
    const control = dropdownMenuItemConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const option of control.options) {
      expect(VALID_STATES).toContain(option as DropdownMenuItemState);
    }
  });
});

// ===========================================================================
// 3. dropdownMenuItemConfig.snippet — pure string builder
//    State model: snippet ALWAYS emits `state="<state>"` as a bare JSX prop.
// ===========================================================================

describe("dropdownMenuItemConfig.snippet: state prop emission", () => {
  it("emits state=\"idle\" for the idle option", () => {
    expect(snippet({ state: "idle" })).toContain('state="idle"');
  });

  it("emits state=\"hover\" for the hover option", () => {
    expect(snippet({ state: "hover" })).toContain('state="hover"');
  });

  it("emits state=\"press\" for the press option", () => {
    expect(snippet({ state: "press" })).toContain('state="press"');
  });

  it("emits the correct state for every control option", () => {
    const control = dropdownMenuItemConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const state of control.options) {
      const out = snippet({ state });
      expect(out).toContain(`state="${state}"`);
    }
  });
});

describe("dropdownMenuItemConfig.snippet: import line", () => {
  it("includes `import { DropdownMenuItem }` from the correct path", () => {
    const out = snippet({ state: "hover" });
    expect(out).toContain('import { DropdownMenuItem }');
    expect(out).toContain('from "@/components/remocn/dropdown-menu-item"');
  });
});

describe("dropdownMenuItemConfig.snippet: default props are omitted", () => {
  // Defaults: label="Profile", mode="light"
  const allDefaults = snippet({
    state: "hover",
    label: "Profile",
    mode: "light",
  });

  it("omits label when it equals the default 'Profile'", () => {
    expect(allDefaults).not.toContain("label=");
  });

  it("omits mode when it equals the default 'light'", () => {
    expect(allDefaults).not.toContain("mode=");
  });
});

describe("dropdownMenuItemConfig.snippet: non-default props are emitted", () => {
  it("emits a non-default label", () => {
    expect(snippet({ state: "hover", label: "Settings" }))
      .toContain('label="Settings"');
  });

  it("emits a non-default mode", () => {
    expect(snippet({ state: "hover", mode: "dark" }))
      .toContain('mode="dark"');
  });
});

describe("dropdownMenuItemConfig.snippet: structural round-trip", () => {
  const out = snippet({ state: "hover" });

  it("starts with the import line", () => {
    expect(out.startsWith('import { DropdownMenuItem }')).toBe(true);
  });

  it("contains a <DropdownMenuItem JSX opening", () => {
    expect(out).toContain("<DropdownMenuItem");
  });

  it("ends with a self-closing />", () => {
    expect(out.trimEnd().endsWith("/>")).toBe(true);
  });
});

// ===========================================================================
// 4. dropdownMenuItemStyleContext — derives concrete colors from the theme.
//    Signature is `(theme)` — NO variant argument.
//    Build ctx from the default light theme and assert each field is populated.
// ===========================================================================

describe("dropdownMenuItemStyleContext: field types from defaultLightTheme", () => {
  it("idleBg is a non-empty string", () => {
    expect(typeof ctx.idleBg).toBe("string");
    expect(ctx.idleBg.length).toBeGreaterThan(0);
  });

  it("hoverBg is a non-empty string", () => {
    expect(typeof ctx.hoverBg).toBe("string");
    expect(ctx.hoverBg.length).toBeGreaterThan(0);
  });

  it("pressBg is a non-empty string", () => {
    expect(typeof ctx.pressBg).toBe("string");
    expect(ctx.pressBg.length).toBeGreaterThan(0);
  });

  it("idleFg is a non-empty string", () => {
    expect(typeof ctx.idleFg).toBe("string");
    expect(ctx.idleFg.length).toBeGreaterThan(0);
  });
});

describe("dropdownMenuItemStyleContext: maps theme tokens correctly", () => {
  it("idleBg equals theme.popover", () => {
    expect(ctx.idleBg).toBe(defaultLightTheme.popover);
  });

  it("hoverBg equals theme.accent", () => {
    expect(ctx.hoverBg).toBe(defaultLightTheme.accent);
  });

  it("idleFg equals theme.popoverForeground", () => {
    expect(ctx.idleFg).toBe(defaultLightTheme.popoverForeground);
  });
});

// ===========================================================================
// 5. dropdownMenuItemStyle presets — pure (state, ctx) => DropdownMenuItemStyle
//    No check icon, no `selected` state (3 states only).
//    Build one ctx from the default light theme, then assert the numeric invariants.
// ===========================================================================

describe("dropdownMenuItemStyle: idle state", () => {
  const s = dropdownMenuItemStyle("idle", ctx);

  it("background is ctx.idleBg", () => {
    expect(s.background).toBe(ctx.idleBg);
  });

  it("labelColor is ctx.idleFg", () => {
    expect(s.labelColor).toBe(ctx.idleFg);
  });

  it("scale is 1 (full size)", () => {
    expect(s.scale).toBe(1);
  });
});

describe("dropdownMenuItemStyle: hover state", () => {
  const s = dropdownMenuItemStyle("hover", ctx);

  it("background is ctx.hoverBg", () => {
    expect(s.background).toBe(ctx.hoverBg);
  });

  it("labelColor is ctx.idleFg", () => {
    expect(s.labelColor).toBe(ctx.idleFg);
  });

  it("scale is 1 (full size)", () => {
    expect(s.scale).toBe(1);
  });
});

describe("dropdownMenuItemStyle: press state", () => {
  const s = dropdownMenuItemStyle("press", ctx);

  it("background is ctx.pressBg", () => {
    expect(s.background).toBe(ctx.pressBg);
  });

  it("labelColor is ctx.idleFg", () => {
    expect(s.labelColor).toBe(ctx.idleFg);
  });

  it("scale is 0.98 (slightly shrunk)", () => {
    expect(s.scale).toBe(0.98);
  });
});

describe("dropdownMenuItemStyle: scale invariant summary", () => {
  it("idle: scale=1", () => {
    expect(dropdownMenuItemStyle("idle", ctx).scale).toBe(1);
  });

  it("hover: scale=1", () => {
    expect(dropdownMenuItemStyle("hover", ctx).scale).toBe(1);
  });

  it("press: scale=0.98", () => {
    expect(dropdownMenuItemStyle("press", ctx).scale).toBe(0.98);
  });
});

// ===========================================================================
// 6. tweenDropdownMenuItemStyle — pure interpolation between two
//    DropdownMenuItemStyles. Numeric fields lerp; color fields via mixOklch.
//    Concrete expectations: idle → press for scale midpoint math.
// ===========================================================================

describe("tweenDropdownMenuItemStyle: t=0 returns values equal to `a`", () => {
  const a = dropdownMenuItemStyle("idle", ctx);
  const b = dropdownMenuItemStyle("press", ctx);
  const r = tweenDropdownMenuItemStyle(a, b, 0);

  it("scale equals a.scale at t=0", () => {
    expect(r.scale).toBeCloseTo(a.scale, 10);
  });

  it("background is a non-empty string at t=0", () => {
    expect(typeof r.background).toBe("string");
    expect(r.background.length).toBeGreaterThan(0);
  });

  it("labelColor is a non-empty string at t=0", () => {
    expect(typeof r.labelColor).toBe("string");
    expect(r.labelColor.length).toBeGreaterThan(0);
  });
});

describe("tweenDropdownMenuItemStyle: t=1 returns values equal to `b`", () => {
  const a = dropdownMenuItemStyle("idle", ctx);
  const b = dropdownMenuItemStyle("press", ctx);
  const r = tweenDropdownMenuItemStyle(a, b, 1);

  it("scale equals b.scale at t=1", () => {
    expect(r.scale).toBeCloseTo(b.scale, 10);
  });

  it("background is a non-empty string at t=1", () => {
    expect(typeof r.background).toBe("string");
    expect(r.background.length).toBeGreaterThan(0);
  });

  it("labelColor is a non-empty string at t=1", () => {
    expect(typeof r.labelColor).toBe("string");
    expect(r.labelColor.length).toBeGreaterThan(0);
  });
});

describe("tweenDropdownMenuItemStyle: t=0.5 midpoint numeric lerp (idle → press)", () => {
  // idle:  scale=1
  // press: scale=0.98
  const a = dropdownMenuItemStyle("idle", ctx);
  const b = dropdownMenuItemStyle("press", ctx);
  const r = tweenDropdownMenuItemStyle(a, b, 0.5);

  it("scale midpoint: 1 → 0.98 gives 0.99", () => {
    expect(r.scale).toBeCloseTo(0.99, 10);
  });
});

describe("tweenDropdownMenuItemStyle: t=0.5 midpoint numeric lerp (hover → idle)", () => {
  // hover: scale=1
  // idle:  scale=1
  const a = dropdownMenuItemStyle("hover", ctx);
  const b = dropdownMenuItemStyle("idle", ctx);
  const r = tweenDropdownMenuItemStyle(a, b, 0.5);

  it("scale midpoint: 1 → 1 gives 1", () => {
    expect(r.scale).toBeCloseTo(1, 10);
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

  it("equals 8 (item default — shorter than container's 12)", () => {
    expect(DEFAULT_DURATION).toBe(8);
  });
});
