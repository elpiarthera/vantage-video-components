"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";
import {
  buttonStyle,
  buttonStyleContext,
  type ButtonStyle,
  type ButtonStyleContext,
} from "@/components/remocn/button";
import {
  SelectItemRow,
  selectItemStyle,
  selectItemStyleContext,
  type SelectItemState,
  type SelectItemStyle,
  type SelectItemStyleContext,
} from "@/components/remocn/select-item";

export type SelectState = "opened" | "closed";

export interface SelectProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: SelectState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `SelectStyle` from `useSelectTransition`.
   */
  style?: SelectStyle;
  /** Trigger text (the always-visible row). */
  label?: string;
  /**
   * Resolved Button visual for the trigger (smooth path). Drive it with
   * `useButtonTransition` for a hover/press "click". Defaults to the resting
   * Button `outline` look.
   */
  triggerStyle?: ButtonStyle;
  /** Option labels rendered in the panel. */
  items?: string[];
  /** Index of the persisted selection (check icon + accent). `-1` for none. */
  selectedIndex?: number;
  /** Index of the row under the pointer (hover wash). `-1` for none. */
  highlightedIndex?: number;
  /** Index of the row being pressed (press wash + shrink). `-1` for none. */
  pressedIndex?: number;
  /**
   * Per-item resolved visual override (smooth path). When an entry is present it
   * wins over the index→state derivation — used by the live example to tween a
   * single row through hover → press → selected.
   */
  itemStyles?: (SelectItemStyle | undefined)[];
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Trigger width = panel width (px). */
const WIDTH = 260;

// ===========================================================================
// Select visual — the COMPLETE animated look for a moment in time. A `state` is
// a named preset of this visual (`selectStyle`); the smooth path feeds an
// interpolated `SelectStyle` straight through. The component is a pure renderer
// of whichever `SelectStyle` it receives. Per-row visuals are derived from the
// index props (or `itemStyles`), independent of this container reveal.
// ===========================================================================

export interface SelectStyle {
  /** Panel fade 0 (closed) → 1 (opened). */
  panelOpacity: number;
  /** Panel zoom 0.96 (closed) → 1 (opened). */
  panelScale: number;
  /** Panel lift -4 (closed) → 0 (opened) px. */
  panelTranslateY: number;
  /** Trigger chevron rotation 0 (closed) → 180 (opened) degrees. */
  chevronRotation: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface SelectStyleContext {
  /** Button `outline` presets — reused so the trigger IS the Button look. */
  triggerCtx: ButtonStyleContext;
  panelBg: string;
  panelBorder: string;
  triggerFg: string;
  mutedFg: string;
  radius: number;
  itemCtx: SelectItemStyleContext;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `selectStyle(state, ctx)` preset.
 */
export function selectStyleContext(theme: RemocnTheme): SelectStyleContext {
  return {
    triggerCtx: buttonStyleContext("outline", theme),
    panelBg: theme.popover,
    panelBorder: theme.border,
    triggerFg: theme.foreground,
    mutedFg: theme.mutedForeground,
    radius: theme.radius,
    itemCtx: selectItemStyleContext(theme),
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => SelectStyle`
 * map. To change how a state looks, edit one entry.
 */
export function selectStyle(
  state: SelectState,
  _ctx: SelectStyleContext,
): SelectStyle {
  switch (state) {
    case "opened":
      return {
        panelOpacity: 1,
        panelScale: 1,
        panelTranslateY: 0,
        chevronRotation: 180,
      };
    default:
      return {
        panelOpacity: 0,
        panelScale: 0.96,
        panelTranslateY: -4,
        chevronRotation: 0,
      };
  }
}

/** Resolve one row's state from the index props (used when no itemStyle override). */
function rowState(
  i: number,
  selectedIndex: number,
  highlightedIndex: number,
  pressedIndex: number,
): SelectItemState {
  if (i === pressedIndex) return "press";
  if (i === selectedIndex) return "selected";
  if (i === highlightedIndex) return "hover";
  return "idle";
}

export function Select({
  state = "closed",
  style,
  label = "Select a fruit",
  triggerStyle,
  items = ["Apple", "Banana", "Orange", "Grape"],
  selectedIndex = -1,
  highlightedIndex = -1,
  pressedIndex = -1,
  itemStyles,
  theme: themeOverride,
  mode,
  className,
}: SelectProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = selectStyleContext(theme);
  const v = style ?? selectStyle(state, ctx);

  // The trigger reuses the Button `outline` visual. Defaults to the resting
  // `idle` look; the caller can pass a tweened `triggerStyle` (from
  // `useButtonTransition`) so the trigger shows the hover/press "click".
  const trigger: ButtonStyle = triggerStyle ?? buttonStyle("idle", ctx.triggerCtx);
  const itemRadius = theme.radius - 2;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // OPAQUE wrapper — a select is a self-contained widget, not a modal layer.
        background: theme.background,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ position: "relative", width: WIDTH }}>
        {/* Trigger — the Button `outline` look, rendered inline. */}
        <div
          style={{
            width: WIDTH,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            height: 40,
            padding: "0 16px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: ctx.triggerFg,
            transform: `translateY(${trigger.translateY}px) scale(${trigger.scale})`,
            background: trigger.background,
            border: `1px solid ${ctx.panelBorder}`,
            borderRadius: ctx.radius,
          }}
        >
          <span>{label}</span>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              flexShrink: 0,
              transform: `rotate(${v.chevronRotation}deg)`,
            }}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke={ctx.mutedFg}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Panel — opacity/scale/translateY animate the reveal below the trigger. */}
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: WIDTH,
            boxSizing: "border-box",
            transformOrigin: "top",
            transform: `translateY(${v.panelTranslateY}px) scale(${v.panelScale})`,
            opacity: v.panelOpacity,
            background: ctx.panelBg,
            border: `1px solid ${ctx.panelBorder}`,
            borderRadius: ctx.radius,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 16px 32px -12px rgba(0,0,0,0.25)",
          }}
        >
          {items.map((item, i) => {
            const override = itemStyles?.[i];
            return (
              <SelectItemRow
                key={item}
                style={
                  override ??
                  selectItemStyle(
                    rowState(i, selectedIndex, highlightedIndex, pressedIndex),
                    ctx.itemCtx,
                  )
                }
                ctx={ctx.itemCtx}
                label={item}
                width={WIDTH - 8}
                radius={itemRadius}
                check={ctx.itemCtx.check}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
