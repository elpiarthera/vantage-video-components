# `button` — verification tests

Pure / deterministic verification for the `button` component
(`registry/remocn-ui/button/`). The RENDER path needs Remotion's
`useCurrentFrame()` and cannot run headless, so the render is NOT exercised
here. This suite covers the pieces that ARE pure: the `BUTTON_SCENARIOS` data
shape, the reducer's phase mapping, and `buttonConfig.snippet` codegen.

## How to run

The repo uses **Bun**, which has a built-in test runner — runs TypeScript
natively, no test-framework dep.

```bash
bun install
bun test registry/remocn-ui/button/__tests__
```

`button.test.ts` imports `bun:test` (not `vitest`/`jest`), so no test script
or framework dep is added to `package.json`.

## What is covered

- **`BUTTON_SCENARIOS` validity** — REAL export, plain data. Asserts: exactly the
  four scenario keys; every step has a numeric, non-negative `at`; every
  `action` is in the `ButtonAction` union; `idle` is empty; `happy`/`error` have
  strictly increasing `at`; `happy` ends with `success`; `error` ends with
  `reset`; `loading` is a single `loading` step.
- **Reducer phase mapping** — the reducer is **NOT exported** (module-private
  `function reducer` in `index.tsx:88-107`). The phase map is replicated as a
  SPEC MIRROR (`hover→hover, press→press, release→hover, loading→loading,
  success→success, reset→error`) and folded over each scenario: `idle`→`idle`,
  `happy`→`success`, `error`→`error`, `loading`→`loading`. The mirror is
  cross-checked against the scenarios' last actions. See testability gap below.
- **`buttonConfig.snippet`** — REAL pure string builder (high value). Asserts:
  emits `steps={[`; never leaks `scenario`; includes `import { Button }`;
  omits props equal to defaults (`label=Continue`, `variant=default`,
  `size=default`, `mode=light`); EMITS non-default `label`/`variant`/`size`/
  `mode`; defaults scenario to `happy`; embeds each `BUTTON_SCENARIOS.happy`
  step's `at`/`action`; `idle`→`steps={[]}`; entry count matches per scenario;
  structural round-trip (starts with import, contains `<Button`, ends `/>`).
- **`serializeSteps` emission** — NOT exported (module-private in
  `config.ts:9-19`). Replicated as a SPEC MIRROR (`[]` for empty, omits/includes
  `duration`) and the mirror's `happy` output is asserted to be a SUBSTRING of
  the REAL snippet, proving the mirror tracks the real serializer.

## Import strategy

`button.test.ts` imports the REAL `BUTTON_SCENARIOS` (from `../index`) and
the REAL `buttonConfig` (from `../config`) via **relative paths** — matching
`ui-core/__tests__/color.test.ts`, which uses `../color`, not the `@/` alias.
`bun test` does resolve tsconfig `paths`, but relative imports are the proven,
alias-independent form used by the existing suite. Importing `index.tsx` pulls
the `remotion` module, but the pieces under test never CALL `useCurrentFrame()`
at import time (`BUTTON_SCENARIOS` is an object literal; `.snippet` is a pure
function), so no Remotion render tree is required.

> If `bun test` cannot resolve `remotion` at import (e.g. the package is not
> installed), switch the top two imports to a local re-derivation: copy the
> `BUTTON_SCENARIOS` literal and the `snippet`/`serializeSteps` bodies as
> annotated MIRRORS — the section 2 and section 4 mirrors already demonstrate
> the pattern. The numeric/string expectations are the verification value; the
> import is just the harness.

## Determinism grep checklist (run manually; must print NOTHING)

The `ui` tier contract is "pure function of `useCurrentFrame()`" (plan §6): no
React state, no DOM events, no wall-clock, no randomness in the tier source.
Verify `button` (and the rest of the tier) with:

```bash
grep -nE "useState|useEffect|onClick|onChange|addEventListener|Date\.now|Math\.random" \
  registry/remocn-ui/button/index.tsx
```

Expected: no output (exit code 1). Any match is a determinism violation. The
spinner rotation in `button` is driven by `frame * speed * 6` (the injected
playhead), NOT `Date.now()` / RAF — keep it that way.

Tier-wide sweep (mirrors the ui-core checklist):

```bash
grep -nE "useState|useEffect|onClick|onChange|addEventListener|Date\.now|Math\.random" \
  registry/remocn-ui/button/index.tsx registry/remocn-ui/core/*.ts
```
