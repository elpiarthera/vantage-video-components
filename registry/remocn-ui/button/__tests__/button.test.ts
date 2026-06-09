/**
 * Verification tests for the PURE / DETERMINISTIC parts of `button`.
 *
 * Scope:
 *   - registry/remocn-ui/button/index.tsx — BUTTON_SCENARIOS shape + the
 *     (module-private) reducer's phase mapping.
 *   - registry/remocn-ui/button/config.ts — buttonConfig.snippet output +
 *     the (module-private) serializeSteps emission.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/button/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY — why we import REAL code here (unlike ui-core/timeline)
 * --------------------------------------------------------------------------
 * `index.tsx` and `config.ts` both top-level `import { … } from "remotion"`
 * (index) / re-use BUTTON_SCENARIOS (config). The ui-core `timeline.test.ts`
 * REPLICATED its fold because the impure part — `useCurrentFrame()` — is CALLED
 * at module evaluation inside a hook. Here, by contrast, the pieces under test
 * (`BUTTON_SCENARIOS`, `buttonConfig.snippet`, the reducer) never CALL a
 * Remotion runtime API at import time:
 *   - `BUTTON_SCENARIOS` is a plain object literal.
 *   - `buttonConfig.snippet` is a pure string builder.
 * Importing `remotion` only registers its module; it does not invoke
 * `useCurrentFrame`. So we import the REAL source via RELATIVE paths (matching
 * `color.test.ts` which uses `../color`, NOT the `@/` alias — `bun test` does
 * resolve tsconfig `paths`, but relative is the proven, alias-independent form).
 *
 * The reducer is NOT exported (module-private `function reducer` in index.tsx).
 * We therefore (a) assert everything reachable about it INDIRECTLY via the
 * scenario shapes, and (b) replicate its documented phase mapping as a SPEC
 * MIRROR (annotated with source line ranges) so the phase contract is pinned.
 * See TESTABILITY GAP note at the bottom.
 *
 * MAINTENANCE CONTRACT: if index.tsx's reducer body or config.ts's
 * serializeSteps body changes, the MIRROR replicas below MUST be updated in
 * lockstep. The replicas are annotated with the source line ranges they mirror.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  BUTTON_SCENARIOS,
  type ButtonAction,
  type ButtonPhase,
  type ButtonScenario,
} from "../index";
import { buttonConfig } from "../config";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/** The ButtonAction union, enumerated as a runtime list for membership checks. */
const VALID_ACTIONS: readonly ButtonAction[] = [
  "hover",
  "press",
  "release",
  "loading",
  "success",
  "reset",
];

const SCENARIO_KEYS: readonly ButtonScenario[] = [
  "happy",
  "loading",
  "error",
  "idle",
];

// ===========================================================================
// 1. BUTTON_SCENARIOS validity (real export, plain data — fully pure)
// ===========================================================================

describe("BUTTON_SCENARIOS", () => {
  it("exposes exactly the four documented scenario keys", () => {
    expect(Object.keys(BUTTON_SCENARIOS).sort()).toEqual(
      [...SCENARIO_KEYS].sort(),
    );
  });

  it("every step in every scenario has a numeric, non-negative `at`", () => {
    for (const key of SCENARIO_KEYS) {
      for (const step of BUTTON_SCENARIOS[key]) {
        expect(typeof step.at).toBe("number");
        expect(Number.isFinite(step.at)).toBe(true);
        expect(step.at).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("every step's `action` is a member of the ButtonAction union", () => {
    for (const key of SCENARIO_KEYS) {
      for (const step of BUTTON_SCENARIOS[key]) {
        expect(VALID_ACTIONS).toContain(step.action);
      }
    }
  });

  it("`idle` is empty", () => {
    expect(BUTTON_SCENARIOS.idle).toEqual([]);
  });

  it("`happy` and `error` have strictly increasing `at` values", () => {
    for (const key of ["happy", "error"] as const) {
      const ats = BUTTON_SCENARIOS[key].map((s) => s.at);
      for (let i = 1; i < ats.length; i++) {
        expect(ats[i]).toBeGreaterThan(ats[i - 1]);
      }
    }
  });

  it("`happy` ends with a `success` action", () => {
    const steps = BUTTON_SCENARIOS.happy;
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].action).toBe("success");
  });

  it("`error` ends with a `reset` action", () => {
    const steps = BUTTON_SCENARIOS.error;
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].action).toBe("reset");
  });

  it("`loading` is a single `loading` step", () => {
    expect(BUTTON_SCENARIOS.loading).toHaveLength(1);
    expect(BUTTON_SCENARIOS.loading[0].action).toBe("loading");
  });
});

// ===========================================================================
// 2. Reducer phase mapping — MIRROR of index.tsx reducer (lines 90-109)
//    The reducer is NOT exported; this replica pins the documented contract.
//    See TESTABILITY GAP note at the bottom of this file.
// ===========================================================================

/**
 * MIRROR of the module-private `reducer` in index.tsx (lines 90-109) plus the
 * DEFAULT_STATE seed (line 79). Phase per action:
 *   hover→hover, press→press, release→hover, loading→loading,
 *   success→success, reset→idle (the destructive flash is IN-FLIGHT ONLY via
 *   isActiveReset; once the reset window closes the button settles to idle).
 */
const PHASE_AFTER_ACTION: Record<ButtonAction, ButtonPhase> = {
  hover: "hover",
  press: "press",
  release: "hover",
  loading: "loading",
  success: "success",
  reset: "idle",
};

/** MIRROR fold: seed = idle, apply each step's action via the map. */
function phaseAfter(steps: { action: ButtonAction }[]): ButtonPhase {
  let phase: ButtonPhase = "idle";
  for (const step of steps) {
    phase = PHASE_AFTER_ACTION[step.action];
  }
  return phase;
}

describe("reducer phase mapping (spec mirror of index.tsx:88-107)", () => {
  it("each action maps to its documented terminal phase", () => {
    expect(PHASE_AFTER_ACTION.hover).toBe("hover");
    expect(PHASE_AFTER_ACTION.press).toBe("press");
    expect(PHASE_AFTER_ACTION.release).toBe("hover");
    expect(PHASE_AFTER_ACTION.loading).toBe("loading");
    expect(PHASE_AFTER_ACTION.success).toBe("success");
    // `reset` settles to idle. The destructive flash is in-flight only
    // (driven by isActiveReset in the render path), NOT a settled phase.
    expect(PHASE_AFTER_ACTION.reset).toBe("idle");
  });

  it("folding `idle` (empty) stays idle", () => {
    expect(phaseAfter(BUTTON_SCENARIOS.idle)).toBe("idle");
  });

  it("folding `happy` lands on `success`", () => {
    expect(phaseAfter(BUTTON_SCENARIOS.happy)).toBe("success");
  });

  it("folding `error` lands on `idle` (reset settles to idle, flash is in-flight only)", () => {
    expect(phaseAfter(BUTTON_SCENARIOS.error)).toBe("idle");
  });

  it("folding `loading` lands on `loading`", () => {
    expect(phaseAfter(BUTTON_SCENARIOS.loading)).toBe("loading");
  });

  it("the terminal phase agrees with the scenario's last action", () => {
    for (const key of SCENARIO_KEYS) {
      const steps = BUTTON_SCENARIOS[key];
      if (steps.length === 0) {
        expect(phaseAfter(steps)).toBe("idle");
        continue;
      }
      const lastAction = steps[steps.length - 1].action;
      expect(phaseAfter(steps)).toBe(PHASE_AFTER_ACTION[lastAction]);
    }
  });
});

// ===========================================================================
// 3. buttonConfig.snippet — REAL pure string builder (high value)
// ===========================================================================

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  scenario?: string;
  label?: string;
  variant?: string;
  size?: string;
  mode?: string;
  primary?: string;
};

const snippet = (values: SnippetValues): string =>
  buttonConfig.snippet(values as Record<string, unknown>);

describe("buttonConfig.snippet", () => {
  const happy = snippet({
    scenario: "happy",
    label: "Continue",
    variant: "default",
    size: "default",
    mode: "light",
    primary: "#171717",
  });

  it("emits the `steps={[` literal", () => {
    expect(happy).toContain("steps={[");
  });

  it("does NOT leak the `scenario` prop into the snippet", () => {
    // scenario is resolved to steps at snippet time; it must never appear as a
    // prop or key in the emitted JSX.
    expect(happy).not.toContain("scenario");
  });

  it("includes the `import { Button }` line", () => {
    expect(happy).toContain('import { Button }');
    expect(happy).toContain('from "@/components/remocn/button"');
  });

  it("omits all props that equal their defaults", () => {
    // label=Continue, variant=default, size=default, mode=light, primary=#171717
    // are all defaults → only `steps` should remain.
    expect(happy).not.toContain("label=");
    expect(happy).not.toContain("variant=");
    expect(happy).not.toContain("size=");
    expect(happy).not.toContain("mode=");
    expect(happy).not.toContain("primary=");
    expect(happy).toContain("steps={");
  });

  it("emits a non-default `label`", () => {
    const out = snippet({ scenario: "happy", label: "Submit" });
    expect(out).toContain('label="Submit"');
  });

  it("emits a non-default `variant`", () => {
    const out = snippet({ scenario: "happy", variant: "destructive" });
    expect(out).toContain('variant="destructive"');
  });

  it("emits a non-default `size`", () => {
    const out = snippet({ scenario: "happy", size: "lg" });
    expect(out).toContain('size="lg"');
  });

  it("emits a non-default `mode`", () => {
    const out = snippet({ scenario: "happy", mode: "dark" });
    expect(out).toContain('mode="dark"');
  });

  it("omits `primary` when it equals the default #171717", () => {
    const out = snippet({ scenario: "happy", primary: "#171717" });
    expect(out).not.toContain("primary=");
  });

  it("emits a non-default `primary`", () => {
    const out = snippet({ scenario: "happy", primary: "#6366f1" });
    expect(out).toContain('primary="#6366f1"');
  });

  it("defaults scenario to `happy` when omitted", () => {
    const withDefault = snippet({});
    const explicitHappy = snippet({ scenario: "happy" });
    expect(withDefault).toBe(explicitHappy);
  });

  it("serializes each happy step's `at` and `action` into the steps literal", () => {
    for (const step of BUTTON_SCENARIOS.happy) {
      expect(happy).toContain(`at: ${step.at}`);
      expect(happy).toContain(`action: "${step.action}"`);
    }
  });

  it("emits `steps={[]}` for the empty `idle` scenario", () => {
    const out = snippet({ scenario: "idle" });
    expect(out).toContain("steps={[]}");
  });

  it("emits the right number of step entries for each scenario", () => {
    for (const key of SCENARIO_KEYS) {
      const out = snippet({ scenario: key });
      const entryCount = (out.match(/action:/g) ?? []).length;
      expect(entryCount).toBe(BUTTON_SCENARIOS[key].length);
    }
  });

  it("produces output that round-trips to a valid-looking JSX block", () => {
    // Structural smoke: opens with the import, contains a self-closing Button.
    expect(happy.startsWith("import { Button }")).toBe(true);
    expect(happy).toContain("<Button");
    expect(happy.trimEnd().endsWith("/>")).toBe(true);
  });
});

// ===========================================================================
// 4. serializeSteps emission — MIRROR of config.ts serializeSteps (lines 9-19)
//    serializeSteps is NOT exported; this replica pins the emission format and
//    is cross-checked against the REAL snippet output above.
//    See TESTABILITY GAP note at the bottom.
// ===========================================================================

/** MIRROR of config.ts:serializeSteps (lines 9-19). */
function serializeStepsMirror(
  steps: { at: number; action: ButtonAction; duration?: number }[],
): string {
  if (steps.length === 0) return "[]";
  const body = steps
    .map((step) => {
      const parts = [`at: ${step.at}`, `action: "${step.action}"`];
      if (step.duration !== undefined) parts.push(`duration: ${step.duration}`);
      return `    { ${parts.join(", ")} },`;
    })
    .join("\n");
  return `[\n${body}\n  ]`;
}

describe("serializeSteps emission (spec mirror of config.ts:9-19)", () => {
  it("returns `[]` for empty steps", () => {
    expect(serializeStepsMirror([])).toBe("[]");
  });

  it("omits the `duration` key when undefined", () => {
    const out = serializeStepsMirror([{ at: 10, action: "hover" }]);
    expect(out).not.toContain("duration");
    expect(out).toContain('at: 10, action: "hover"');
  });

  it("includes the `duration` key when present", () => {
    const out = serializeStepsMirror([
      { at: 10, action: "loading", duration: 12 },
    ]);
    expect(out).toContain("duration: 12");
  });

  it("the mirror's happy output is a substring of the REAL snippet", () => {
    // Cross-check: proves the mirror tracks the real serializer, and that the
    // real snippet embeds exactly the BUTTON_SCENARIOS.happy steps.
    const mirrored = serializeStepsMirror(BUTTON_SCENARIOS.happy);
    const real = snippet({ scenario: "happy" });
    expect(real).toContain(mirrored);
  });
});
