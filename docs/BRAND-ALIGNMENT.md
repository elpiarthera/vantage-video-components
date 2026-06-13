# Brand Alignment — VantageOS / ElPi Corp

**Date**: 2026-06-13
**Author**: Rho — VantageOS Team
**Reference**: `docs/brand-kit-2026-05-12.md`

## Summary

First-pass brand alignment applied to token and theme layer only. Component source files are not touched in Phase A — component porting with brand adaptation is Phase B work.

## Token Mapping

| Token | Upstream remocn | vantage-video-components | Source |
|---|---|---|---|
| `--background` (dark) | `oklch(0.18 0.008 290)` (warm obsidian) | `oklch(0.16 0 0)` = `#0a0a0a` | Brand kit §2 `--background` |
| `--accent` | `oklch(0.22 0.008 290)` (neutral muted) | `oklch(0.74 0.16 60)` = `#f59e0b` | Brand kit §2 `--accent` |
| `--primary` (dark) | `oklch(0.95 0 0)` (near-white) | `oklch(0.74 0.16 60)` = `#f59e0b` | Brand kit — amber is the primary emphasis |
| `--foreground` (dark) | `oklch(0.95 0 0)` | `oklch(0.91 0 0)` = `#e5e7eb` | Brand kit §2 `--prose-body` |
| `--ring` | `oklch(1 0 0 / 20%)` | `oklch(0.74 0.16 60)` | Brand kit — amber ring focus |
| `--sidebar-accent` | `oklch(0.22 0.008 290)` | `oklch(0.74 0.16 60)` | Brand kit — amber sidebar active |

## VantageOS Semantic Tokens Added

New CSS custom properties added to `:root` for use in brand-aligned component demos:

```css
--vantage-bg:      oklch(0.16 0 0)        /* #0a0a0a  near-black canvas */
--vantage-surface: oklch(0.18 0.008 290)  /* #141414  raised surfaces */
--vantage-accent:  oklch(0.74 0.16 60)    /* #f59e0b  warm amber — single per frame */
--vantage-muted:   oklch(0.65 0 0)        /* #9ca3af  secondary text */
--vantage-prose:   oklch(0.91 0 0)        /* #e5e7eb  body text */
--vantage-border:  oklch(0.22 0 0)        /* #1f2937  dividers */
--vantage-heading: oklch(1 0 0)           /* #ffffff  headings (sparingly) */
```

## Typography Tokens Added

```css
--font-display:  "Cormorant Display", "Cormorant", Georgia, serif
--font-body:     Georgia, "Times New Roman", serif
--font-caption:  system-ui, -apple-system, BlinkMacSystemFont, sans-serif
```

### Typography Rules (from brand kit §3)

| Level | Size | Font | Weight | Letter-spacing |
|---|---|---|---|---|
| Reel title (H1) | 80px | Cormorant Display | Bold 700 | −2% |
| Reel subhead (H2) | 56px | Cormorant Display | SemiBold 600 | −1.5% |
| Callout (H3) | 40px | Georgia | Bold 700 | −0.5% |
| Body | 24px | Georgia | Regular 400 | 0% |
| Caption | 18px | system-ui | Regular 400 | −0.5% |

Hard constraints:
- Cormorant Display ONLY at ≥56px. Below 56px → Georgia mandatory.
- Never use Cormorant below 32px (thin-stroke collapse at render).
- Body text: use `#e8e0d0` (warm white) not pure `#ffffff` on `#0a0a0a`.

## What Was NOT Changed (Phase A Scope)

- Component source files in `registry/` — Phase B work
- `"use client"` directives in components — Phase B work
- Geist Sans CSS variable references in components — Phase B work
- White background defaults in component demos — Phase B work

## Phase B Component Adaptation Protocol

For each component ported in Phase B, apply:

1. Remove `"use client"` directive
2. Replace `background: "white"` with `background: "transparent"` or prop
3. Replace `var(--font-geist-sans)` with `var(--font-display)` or `var(--font-body)` per size
4. Replace default `color: "#171717"` with `var(--vantage-prose)` or prop
5. Replace default font size `48px` with brand-spec sizes where appropriate
6. Verify: no hardcoded `#ffffff` on `#0a0a0a` — use `#e8e0d0` for body

---

Orchestrator: Rho — VantageOS Team | 2026-06-13
