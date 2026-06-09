"use client";

import {
  buttonStyle,
  buttonStyleContext,
  type ButtonStyle,
  type ButtonStyleContext,
} from "@/components/remocn/button";
import {
  DropdownMenuItemRow,
  dropdownMenuItemStyle,
  dropdownMenuItemStyleContext,
  type DropdownMenuItemStyle,
  type DropdownMenuItemStyleContext,
} from "@/components/remocn/dropdown-menu-item";
import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type DropdownMenuState = "opened" | "closed";

// ===========================================================================
// Dropdown-menu visual — the COMPLETE animated look for a moment in time. A
// `state` is a named preset of this visual (`dropdownMenuStyle`); the smooth
// path feeds an interpolated `DropdownMenuStyle` straight through. The
// component is a pure renderer of whichever style it receives.
// ===========================================================================

export interface DropdownMenuStyle {
  /** Panel fade 0 (closed) → 1 (opened). */
  panelOpacity: number;
  /** Panel zoom 0.96 (closed) → 1 (opened). */
  panelScale: number;
  /** Panel lift -4 (closed) → 0 (opened) px. */
  panelTranslateY: number;
  /** Trigger chevron rotation: 0 (closed) → 180 (opened) deg. */
  chevronRotation: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface DropdownMenuStyleContext {
  /** Trigger reuses the Button `outline` variant look. */
  triggerCtx: ButtonStyleContext;
  panelBg: string;
  panelBorder: string;
  triggerFg: string;
  mutedFg: string;
  radius: number;
  /** Row presets for the panel items. */
  itemCtx: DropdownMenuItemStyleContext;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `dropdownMenuStyle(state, ctx)` preset.
 */
export function dropdownMenuStyleContext(
  theme: RemocnTheme,
): DropdownMenuStyleContext {
  return {
    triggerCtx: buttonStyleContext("outline", theme),
    panelBg: theme.popover,
    panelBorder: theme.border,
    triggerFg: theme.foreground,
    mutedFg: theme.mutedForeground,
    radius: theme.radius,
    itemCtx: dropdownMenuItemStyleContext(theme),
  };
}

/**
 * The COMPLETE resting visual for a state — a pure
 * `(state, ctx) => DropdownMenuStyle` map. To change how a state looks, edit
 * one entry.
 */
export function dropdownMenuStyle(
  state: DropdownMenuState,
  _ctx: DropdownMenuStyleContext,
): DropdownMenuStyle {
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

/** Trigger + panel width (px). */
const WIDTH = 240;

export interface DropdownMenuProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: DropdownMenuState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence
   * over `state` — feed it an interpolated `DropdownMenuStyle` from
   * `useDropdownMenuTransition`.
   */
  style?: DropdownMenuStyle;
  /** Trigger label. */
  label?: string;
  /** Menu rows. */
  items?: string[];
  /** Row currently highlighted (hover); `-1` for none. */
  highlightedIndex?: number;
  /** Row currently pressed; `-1` for none. */
  pressedIndex?: number;
  /**
   * Smooth per-row override. When an entry is present it wins over the
   * index→state derivation, letting the example tween a single row.
   */
  itemStyles?: (DropdownMenuItemStyle | undefined)[];
  /**
   * Resolved Button visual for the trigger (smooth path). Drive it with
   * `useButtonTransition` for a hover/press "click". Defaults to the resting
   * Button `outline` look.
   */
  triggerStyle?: ButtonStyle;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

export function DropdownMenu({
  state = "closed",
  style,
  label = "Options",
  items = ["Profile", "Billing", "Settings", "Log out"],
  highlightedIndex = -1,
  pressedIndex = -1,
  itemStyles,
  triggerStyle,
  theme: themeOverride,
  mode,
  className,
}: DropdownMenuProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  const ctx = dropdownMenuStyleContext(theme);
  const v = style ?? dropdownMenuStyle(state, ctx);

  // The trigger reuses the Button `outline` look: its resting visual provides
  // the background + transform; the foreground/border come from the theme.
  // A driven `triggerStyle` (from `useButtonTransition`) overrides the resting
  // look so the trigger can animate a hover/press "click".
  const trigger = triggerStyle ?? buttonStyle("idle", ctx.triggerCtx);

  return (
    <div
      className={className}
      style={{
        // Opaque — a menu is a self-contained widget (like Button/Accordion),
        // not a modal overlay.
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 220,
        background: theme.background,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ position: "relative", width: WIDTH }}>
        {/* Trigger — the Button `outline` visual, inline-nestable. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            width: WIDTH,
            height: 40,
            padding: "0 16px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: ctx.triggerFg,
            background: trigger.background,
            border: `1px solid ${ctx.panelBorder}`,
            borderRadius: ctx.radius,
            transform: `translateY(${trigger.translateY}px) scale(${trigger.scale})`,
            boxSizing: "border-box",
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
        {/* Panel — sits below the trigger; opacity/scale/translateY animate the
            reveal, transformOrigin top so it grows downward. */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            width: WIDTH,
            opacity: v.panelOpacity,
            transform: `translateY(${v.panelTranslateY}px) scale(${v.panelScale})`,
            transformOrigin: "top",
            background: ctx.panelBg,
            border: `1px solid ${ctx.panelBorder}`,
            borderRadius: ctx.radius + 2,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.18)",
            boxSizing: "border-box",
          }}
        >
          {items.map((item, i) => {
            const override = itemStyles?.[i];
            const rowState =
              i === pressedIndex
                ? "press"
                : i === highlightedIndex
                  ? "hover"
                  : "idle";
            const rowStyle =
              override ?? dropdownMenuItemStyle(rowState, ctx.itemCtx);
            return (
              <DropdownMenuItemRow
                key={item}
                style={rowStyle}
                label={item}
                width={WIDTH - 8}
                theme={themeOverride}
                mode={mode}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
