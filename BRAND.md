# VantageOS / ElPi Corp — Brand Kit Alignment

**Date**: 2026-06-13
**Authority**: `docs/brand-kit-2026-05-12.md` (Phi canonical handoff) + `docs/BRAND-ALIGNMENT.md` (Phase A token mapping)
**Scope**: vantage-video-components registry — components adapted for ElPi Corp reel production pipeline
**Status**: Phase A complete (tokens). Phase B (component-level adaptation) in progress.

---

## 1. Tokens — OKLCH Palette

All color tokens are specified in OKLCH (Lightness Chroma Hue) for perceptual uniformity. Each entry provides the canonical OKLCH triple, hex equivalent, and sRGB fallback for environments that do not support the `oklch()` CSS function.

### Canonical Token Table

| Token | OKLCH | Hex | sRGB fallback | Usage |
|---|---|---|---|---|
| `--vantage-bg` | `oklch(0.16 0 0)` | `#0a0a0a` | `rgb(10, 10, 10)` | Near-black canvas. Primary backdrop for all reel compositions. Never lighten to avoid washing out the chiaroscuro effect. |
| `--vantage-surface` | `oklch(0.18 0.008 290)` | `#141414` | `rgb(20, 20, 20)` | Cards, raised surfaces, panel backgrounds. The `0.008 290` chroma adds the faintest warm-obsidian undertone inherited from remocn upstream. |
| `--vantage-accent` | `oklch(0.74 0.16 60)` | `#f59e0b` | `rgb(245, 158, 11)` | Warm amber. The single brand emphasis point per frame. Use for title accent line, focus rings, active sidebar state. **Restraint rule**: one accent color per scene, never flood the frame. One light source per frame, one amber line per overlay. |
| `--vantage-muted` | `oklch(0.65 0 0)` | `#9ca3af` | `rgb(156, 163, 175)` | Secondary text, metadata, captions, URL watermarks, end-card attribution. Never use for primary body copy on dark canvas — contrast is insufficient for legibility at small sizes. |
| `--vantage-prose` | `oklch(0.91 0 0)` | `#e5e7eb` | `rgb(229, 231, 235)` | Primary body text on dark. Preferred over pure white to retain warmth without the clinical harshness of `#ffffff` against near-black. |
| `--vantage-warm-white` | `oklch(0.93 0.01 80)` | `#e8e0d0` | `rgb(232, 224, 208)` | Warm white for body copy that must sit on `--vantage-bg` directly. Mandatory substitute for `#ffffff` in body and paragraph contexts. |
| `--vantage-secondary-highlight` | `oklch(0.79 0.04 76)` | `#c9b99a` | `rgb(201, 185, 154)` | Secondary warm highlight for sub-accent text elements. Use when a second color tier is needed without introducing amber competition. |
| `--vantage-border` | `oklch(0.22 0 0)` | `#1f2937` | `rgb(31, 41, 55)` | Dividers, component borders, hairlines. Keep barely visible — border reinforcement should never compete with content luminosity. |
| `--vantage-heading` | `oklch(1 0 0)` | `#ffffff` | `rgb(255, 255, 255)` | Top-level headings on dark canvas (Cormorant Display H1 only). Used sparingly — never for body copy or secondary headings. |

### OKLCH in CSS (usage pattern)

```css
/* In :root or Remotion composition wrapper */
:root {
  --vantage-bg:               oklch(0.16 0 0);        /* #0a0a0a */
  --vantage-surface:          oklch(0.18 0.008 290);  /* #141414 */
  --vantage-accent:           oklch(0.74 0.16 60);    /* #f59e0b warm amber */
  --vantage-muted:            oklch(0.65 0 0);        /* #9ca3af */
  --vantage-prose:            oklch(0.91 0 0);        /* #e5e7eb */
  --vantage-warm-white:       oklch(0.93 0.01 80);    /* #e8e0d0 */
  --vantage-secondary-highlight: oklch(0.79 0.04 76); /* #c9b99a */
  --vantage-border:           oklch(0.22 0 0);        /* #1f2937 */
  --vantage-heading:          oklch(1 0 0);           /* #ffffff */
}

/* sRGB fallback block for environments without oklch() support */
@supports not (color: oklch(0 0 0)) {
  :root {
    --vantage-bg:               #0a0a0a;
    --vantage-surface:          #141414;
    --vantage-accent:           #f59e0b;
    --vantage-muted:            #9ca3af;
    --vantage-prose:            #e5e7eb;
    --vantage-warm-white:       #e8e0d0;
    --vantage-secondary-highlight: #c9b99a;
    --vantage-border:           #1f2937;
    --vantage-heading:          #ffffff;
  }
}
```

### Accent restraint rules

- Amber `oklch(0.74 0.16 60)` is the only accent color. Never introduce a second hue as emphasis.
- One accent emphasis point per scene maximum. A scene receiving amber in a title cannot also have amber underlines, amber borders, and amber icons simultaneously.
- Never use amber as background fill for large areas — it functions as a single point of warmth, not a background tone.
- The only tolerated secondary warm tones are `--vantage-warm-white` and `--vantage-secondary-highlight`, which are muted enough not to compete.

---

## 2. Typography Stack

### Font decision tree

The typography system uses three typefaces in strict size-gated roles. This maps the editorial Penguin-Classics visual register to the reel format while maintaining continuity with the live perfectaiagent.xyz site, which uses Georgia and system-ui.

| Level | Min size | Max size | Font | Weight | Letter-spacing | Role |
|---|---|---|---|---|---|---|
| Reel title (H1) | 80px | — | **Cormorant Display** | Bold 700 | −2% (`-0.02em`) | Reel hero title card |
| Reel subhead (H2) | 56px | 79px | **Cormorant Display** | SemiBold 600 | −1.5% (`-0.015em`) | Reel kicker, chapter labels |
| Callout (H3) | 40px | 55px | **Georgia** | Bold 700 | −0.5% (`-0.005em`) | Mid-frame call-out, pull quotes |
| Body | 24px | 39px | **Georgia** | Regular 400 | 0% | Reel body lines, paragraph overlays |
| Caption / metadata | 18px | 23px | **system-ui** | Regular 400 | −0.5% (`-0.005em`) | URL, attribution, end-card |

### Hard constraints (non-negotiable, from AD verdict §10)

1. **Cormorant Display is only authorized at sizes ≥56px.** Below 56px, Georgia is mandatory — no exceptions. The thin strokes of Cormorant Display collapse into illegibility below 32px and lose editorial quality below 56px in motion contexts.
2. **Never use Cormorant below 32px** (thin-stroke collapse).
3. **Never use pure `#ffffff` for body text on `#0a0a0a`.** Use `--vantage-warm-white` (`#e8e0d0`) instead. Pure white on near-black creates a clinical harshness that conflicts with the warm-amber visual identity.
4. **Color assignments**: amber `#f59e0b` for the title accent line; `#ffffff` reserved for the top-level H1 heading only; `#e5e7eb` or `#c9b99a` for secondary text elements.

### CSS font stack declarations

```css
:root {
  --font-display: "Cormorant Display", "Cormorant", Georgia, serif;
  --font-body:    Georgia, "Times New Roman", serif;
  --font-caption: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Loading Cormorant Display in a Remotion composition

**Preferred method** — self-hosted `.woff2` via `@remotion/google-fonts` to eliminate network dependency at render time:

```tsx
// In your Remotion composition (e.g. src/compositions/PerfectAIAgentReel.tsx)
import { loadFont } from "@remotion/google-fonts/CormorantDisplay";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});

// fontFamily resolves to "Cormorant Display" once loaded
// Pass via inline style or CSS variable injection:
<div style={{ fontFamily, fontWeight: 700, fontSize: 80, letterSpacing: "-0.02em" }}>
  {title}
</div>
```

**Fallback (development only)** — Google Fonts CDN import. Do not use in production renders as it introduces a network call inside the render worker:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
```

### Typography usage examples

```tsx
// H1 — Reel title card (80px, Cormorant Display Bold)
<div style={{
  fontFamily: "var(--font-display)",
  fontSize: 80,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "var(--vantage-heading)",   /* #ffffff */
}}>
  Twelve chapters. Thirteen authors.
</div>

// Accent line under H1 (amber underline, 4px)
<div style={{
  width: 64,
  height: 4,
  backgroundColor: "var(--vantage-accent)",  /* #f59e0b */
  marginTop: 16,
}} />

// H2 — Reel subhead (56px, Cormorant Display SemiBold)
<div style={{
  fontFamily: "var(--font-display)",
  fontSize: 56,
  fontWeight: 600,
  letterSpacing: "-0.015em",
  color: "var(--vantage-prose)",  /* #e5e7eb */
}}>
  Only one of them is human.
</div>

// Body (24px, Georgia)
<div style={{
  fontFamily: "var(--font-body)",
  fontSize: 24,
  fontWeight: 400,
  letterSpacing: 0,
  color: "var(--vantage-warm-white)",  /* #e8e0d0 — never pure white */
}}>
  Five hundred complaints. Twelve patterns. Twelve sins.
</div>

// Caption / URL (18px, system-ui)
<div style={{
  fontFamily: "var(--font-caption)",
  fontSize: 18,
  fontWeight: 400,
  letterSpacing: "-0.005em",
  color: "var(--vantage-muted)",  /* #9ca3af */
}}>
  perfectaiagent.xyz
</div>
```

---

## 3. Motion Language Vocabulary

The motion system follows a Penguin Classics editorial register: slow, deliberate, unhurried. Motion should feel like turning a page, not swiping a feed. Snappy transitions are used for UI chrome only — never for narrative scene changes.

### Ease curves

Two primary cubic-bezier curves cover the full range of motion in the system:

| Name | Curve | Character | When to use |
|---|---|---|---|
| `literary-ease` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Slow-in / slow-out. Contemplative, weighty. | All narrative transitions: title reveals, scene fades, body text entrances. This is the primary ease for any motion that carries emotional weight. |
| `ui-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard. Brisker, responsive. | UI chrome only: props tables, control panel interactions, code block reveals in component demos. Never use for narrative scene content. |

```ts
// Remotion spring alternative (for organic motion)
// Use for fade-blur and slide transitions where spring physics feel natural
import { spring } from "remotion";

const progress = spring({
  frame: frame - startFrame,
  fps,
  config: { damping: 14, stiffness: 80, mass: 1.2 }, // slow, literary feel
});
```

### Duration scale

| Name | Duration | Use case |
|---|---|---|
| `short` | 200ms (6 frames at 30fps) | UI chrome micro-interactions only |
| `medium` | 400ms (12 frames) | Text entrance, caption fade-in, CTA appear |
| `long` | 800ms (24 frames) | Image reveal, panel slide, color-shift overlay |
| `scene` | 1500ms (45 frames) | Scene-level transitions (fade between backdrops, zoom pull-back). **Hard limit — see Application Doctrine rule 3.** |

### Named transitions vocabulary

#### `cut`

An instantaneous frame change — zero duration, zero easing. The cinematic hard cut.

**When to use**: high-impact chapter-to-chapter transitions where continuity would soften the contrast (e.g., cutting from a static book cover to a dramatic hero close-up). Effective when the incoming frame is visually distinct enough to land without preparation.

**When not to use**: consecutive cuts without intervening held frames. Two cuts in a row with fewer than 60 frames held in between create visual fatigue. Never cut within a single sentence of text overlay — the viewer needs the sentence to complete before the frame changes.

```tsx
// Remotion: cut is the default — simply change which <Sequence> is active
// No transition component needed. Use <Sequence> start/end frames to control timing.
```

#### `fade`

An opacity interpolation from 0 to 1 (or 1 to 0). The foundational literary transition.

**When to use**: scene openings, scene closings, title card entrances, end-card reveals. Any moment that benefits from the scene "breathing in" before the content lands. Duration: `long` (800ms) for scene fades, `medium` (400ms) for content fades.

**When not to use**: back-to-back fades without a held frame between them (double-fade pattern reads as unresolved). Do not fade between two near-black frames — fade in from black only from a position of silence (cold open or end card).

```tsx
// Remotion fade-in pattern (literary-ease)
const opacity = interpolate(
  frame,
  [startFrame, startFrame + 24],  // 800ms at 30fps
  [0, 1],
  { extrapolateRight: "clamp", easing: (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t }
);
// Or use @remotion/transitions with <Fade /> preset
```

#### `slide`

A positional transition — element enters or exits along an axis (typically Y: down→up, or X: right→left for RTL reading flows).

**When to use**: sequential text lines entering one after another (each body line slides up into position as the previous settles). Works well for bullet-point-style reel sections. Combine with `fade` (opacity 0→1 simultaneously) for a refined entrance.

**When not to use**: sliding the entire scene backdrop — this reads as a page-swipe and conflicts with the editorial register. Slide is reserved for content elements, never for full-frame compositional changes. Do not slide Cormorant Display H1 text — the headline should cut or fade in, not arrive on a conveyor.

#### `zoom`

A scale transition — element or scene scales from a neutral or zoomed-out position to the viewing scale.

**When to use**: dramatic reveals of a hero illustration (slow pull-out from 1.08x to 1.0x over `scene` duration creates the "breath" of an ebook cover). Can be used as a hold effect (Ken Burns slow creep at 1.0x→1.04x over 3 seconds) to add life to static image backdrops.

**When not to use**: zoom-in (scaling from small to large) on text overlays — it reads as presentation-software rather than editorial film. Never zoom the full composition frame more than ±8% (`scale: 1.0` to `1.08` max). Zoom and slide simultaneously is almost always too busy — pick one.

#### `color-shift`

An overlay color transition — typically a semi-transparent warm amber or dark scrim that animates opacity to shift the emotional register of a scene without changing its content.

**When to use**: scene mood transitions within a continuous backdrop (e.g., a hero image that shifts from neutral to warm as the narrator describes an emotional beat). Effective as a 1-2 frame flash on a cut to add a "light flare" moment.

**When not to use**: do not use color-shift as a substitute for a cut or fade — it should accompany content that is changing, not replace the content change itself. Multiple color-shift overlays in a single scene create visual noise. See light-leak restraint note below.

### Light-leak restraint

A light-leak is a momentary amber or warm-white bloom overlay (typically 1-3 frames, opacity 0→0.3→0) that simulates analog film. It adds organic warmth to an otherwise digital composition.

**Rule**: maximum 2-3 light-leaks per reel, total. They lose all impact if overused. Place at major scene transitions only — not on every cut. A reel with a single well-placed light-leak at the emotional peak is stronger than a reel with five distributed across every transition.

```tsx
// Light-leak implementation in Remotion
const leakOpacity = interpolate(
  frame,
  [leakStart, leakStart + 2, leakStart + 5],
  [0, 0.28, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<div style={{
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at 20% 30%, oklch(0.74 0.16 60 / 0.6), transparent 60%)",
  opacity: leakOpacity,
  pointerEvents: "none",
}} />
```

---

## 4. Application Doctrine

Three hard rules that govern every component, template, and composition in this registry.

### Rule 1 — One accent per scene maximum

The warm amber `oklch(0.74 0.16 60)` accent is the only accent color. It may appear once per scene as a single point of emphasis (title underline, active ring, or a single glowing element). A scene that uses amber in a title accent line must not also use amber for a border, icon, and button simultaneously. If amber is structurally required in multiple places (e.g., a props table showing brand colors), reduce opacity on secondary instances to `0.4` to maintain hierarchy.

### Rule 2 — Georgia under 56px always

Cormorant Display is a display typeface with structural thin strokes that read well at large sizes and in still media. In motion contexts, thin strokes can shimmer or collapse on lower-resolution output (1080p vertical). Below 56px, Georgia must be used without exception. This also ensures visual continuity: viewers who visit perfectaiagent.xyz after watching a reel will see Georgia body text matching what they read in the video.

### Rule 3 — Single-transition duration never exceeds 1500ms

A scene-level transition (fade, zoom, or slide on a full compositional change) must complete within 1500ms. If a narrative beat requires a longer journey (e.g., a slow atmospheric opening), the correct approach is to sequence multiple atomic transitions: a 1500ms fade dissolve followed by a 1500ms held frame followed by a 1500ms text reveal — not a single 4500ms fade. This preserves the viewer's sense of pacing and prevents stalled motion that reads as a technical error.

---

## 5. Examples

### Example A — Cinematic cut with title reveal

A hard cut into a hero frame, followed by a `fade` title entrance at `literary-ease`.

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from "remotion";

const TITLE_START = 15; // frames (0.5s at 30fps — brief held beat after cut)
const TITLE_DURATION = 24; // 800ms fade-in

export const CinematicCutTitleReveal: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();

  // Title fade-in with literary-ease approximation
  const titleOpacity = interpolate(
    frame,
    [TITLE_START, TITLE_START + TITLE_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      // literary-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94) approximated via quadratic
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    }
  );

  const titleY = interpolate(
    frame,
    [TITLE_START, TITLE_START + TITLE_DURATION],
    [24, 0],  // slides 24px upward as it fades in
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "oklch(0.16 0 0)" /* --vantage-bg */ }}>
      {/* Hero backdrop — hard-cut in (no transition on the backdrop itself) */}
      <Sequence from={0}>
        <AbsoluteFill>
          <img src="public/brand/hero/ebook-portrait.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>

      {/* Title overlay — fade + slide entrance */}
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "80px 80px 180px" }}>
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: '"Cormorant Display", Georgia, serif',
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",            /* --vantage-heading */
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {/* Amber accent line — one per scene, 400ms after title fully visible */}
        <div
          style={{
            opacity: interpolate(frame, [TITLE_START + TITLE_DURATION, TITLE_START + TITLE_DURATION + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            width: 64,
            height: 4,
            backgroundColor: "oklch(0.74 0.16 60)",  /* --vantage-accent #f59e0b */
            marginTop: 20,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

### Example B — Fade-blur reveal with body text

A scene reveal using opacity fade combined with a CSS `blur` filter to create a soft editorial entrance for body text. Uses `Georgia` as mandated below 56px.

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const REVEAL_START = 0;
const REVEAL_DURATION = 30; // 1000ms — between medium and long, intentional for body text

export const FadeBlurBodyReveal: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [REVEAL_START, REVEAL_START + REVEAL_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // literary-ease
    }
  );

  const blurPx = interpolate(
    frame,
    [REVEAL_START, REVEAL_START + REVEAL_DURATION],
    [8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "oklch(0.16 0 0)", justifyContent: "center", padding: "80px" }}>
      <div
        style={{
          opacity,
          filter: `blur(${blurPx}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: "Georgia, serif",   /* --font-body: Georgia mandatory under 56px */
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: 0,
              color: "oklch(0.93 0.01 80)",   /* --vantage-warm-white #e8e0d0, never pure white */
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </AbsoluteFill>
  );
};
```

### Example C — color-shift overlay (amber scrim on scene transition)

A warm amber scrim that fades in at the emotional peak of a scene, acting as a `color-shift` between two segments. This replaces a cut or a full fade when the backdrop stays constant but the emotional register shifts.

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Place at frame 90 (3s into scene) for a 1500ms mood shift
const SHIFT_START = 90;
const SHIFT_PEAK = 112;   // +22 frames (0.73s)
const SHIFT_END = 135;    // +45 frames total (1.5s) — never exceeds scene duration limit

export const ColorShiftScrim: React.FC = () => {
  const frame = useCurrentFrame();

  const scrimOpacity = interpolate(
    frame,
    [SHIFT_START, SHIFT_PEAK, SHIFT_END],
    [0, 0.22, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 40%, oklch(0.74 0.16 60 / 0.7), transparent 65%)`,
          opacity: scrimOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

// Usage: layer this as a sibling <AbsoluteFill> over the scene content
// One color-shift per scene max. Total reels: max 2-3 light-leaks/color-shifts combined.
```

---

## Document index

| File | Purpose |
|---|---|
| `BRAND.md` | This document — full OKLCH palette + typography stack + motion vocabulary |
| `docs/brand-kit-2026-05-12.md` | Canonical brand kit handoff from Phi (Phase 2 reel, authority source) |
| `docs/BRAND-ALIGNMENT.md` | Phase A first-pass token mapping (what was changed at :root level) |

---

*Authority: Phi canonical brand kit + agency-artistic-director verdict + Pi doctrine + live perfectaiagent.xyz. VantageOS component registry adapts these specs for programmatic Remotion reel production.*

Orchestrator: Rho — VantageOS Team | 2026-06-13
