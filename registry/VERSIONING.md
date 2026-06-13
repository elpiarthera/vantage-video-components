# Registry Versioning Policy

## Philosophy

Each component is versioned independently. The registry index tracks the current
stable set. Because shadcn consumers copy the source into their own repo, version
bumps are informational — there is no runtime dependency to upgrade.

---

## Semver per component

Each `registry/<name>.json` carries a `version` field (semver string).

| Bump | When |
|------|------|
| **patch** `0.x.Y` | Bug fixes, typo corrections, non-visual tweaks |
| **minor** `0.X.0` | New props with backwards-compatible defaults, new visual variants |
| **major** `X.0.0` | Renamed props, removed props, changed default behaviour, file path changes |

During pre-stable development all components are `0.x.y`. A component moves to
`1.0.0` when it has been used in at least one shipped production reel.

---

## Breaking changes

A change is **breaking** if it:

- Renames or removes a required or optional prop
- Changes the default value of a prop in a way that alters render output
- Moves the source file to a different path (changes `files[].target`)
- Adds a peer dependency not already present in a standard Remotion project

### Protocol for breaking changes

1. Bump the major version in `registry/<name>.json`.
2. Add a `## Breaking changes` section to the changelog entry below.
3. Document the migration path (old prop → new prop, or "remove X, use Y").
4. Tag the commit with `breaking(<name>): <short description>`.

---

## Index changelog

### 2026-06-13 — v0.1.0 (Phase C initial registry endpoint)

Components published:

| Component | Version | Notes |
|-----------|---------|-------|
| `cinematic-cut` | `0.1.0` | Hard-cut transition with one-frame accent burst |
| `fade-blur` | `0.1.0` | Opacity + blur fade transition |
| `slide-reveal` | `0.1.0` | Off-screen directional slide with opacity fade |
| `zoom-pulse` | `0.1.0` | Scale pulse with natural overshoot |
| `color-shift` | `0.1.0` | Background-color interpolation via `interpolateColors` |

Registry endpoint (raw GitHub, stable):

```
https://raw.githubusercontent.com/elpiarthera/vantage-video-components/main/registry/<name>.json
```

---

## Adding a new component

1. Drop `registry/<name>.json` conforming to `https://ui.shadcn.com/schema/registry-item.json`.
2. Run `npm run build:registry` — the script validates and regenerates `index.json`.
3. Commit both the component JSON and the updated `index.json`.
4. Add a changelog entry above with the initial version (`0.1.0`).
