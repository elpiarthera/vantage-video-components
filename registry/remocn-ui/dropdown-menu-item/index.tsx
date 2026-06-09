"use client";

import { mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type DropdownMenuItemState = "idle" | "hover" | "press";

// ===========================================================================
// Dropdown-menu-item visual — the COMPLETE animated look for a moment in time.
// A `state` is a named preset of this visual (`dropdownMenuItemStyle`); the
// smooth path feeds an interpolated `DropdownMenuItemStyle` straight through.
// The component is a pure renderer of whichever style it receives.
// ===========================================================================

export interface DropdownMenuItemStyle {
  /** Animated row background. */
  background: string;
  /** Animated label color. */
  labelColor: string;
  /** Row scale: 1 default, 0.98 on press. */
  scale: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface DropdownMenuItemStyleContext {
  idleBg: string;
  hoverBg: string;
  pressBg: string;
  idleFg: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `dropdownMenuItemStyle(state, ctx)` preset.
 */
export function dropdownMenuItemStyleContext(
  theme: RemocnTheme,
): DropdownMenuItemStyleContext {
  return {
    idleBg: theme.popover,
    hoverBg: theme.accent,
    pressBg: mixOklch(theme.accent, theme.foreground, 0.08),
    idleFg: theme.popoverForeground,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure
 * `(state, ctx) => DropdownMenuItemStyle` map. To change how a state looks,
 * edit one entry.
 */
export function dropdownMenuItemStyle(
  state: DropdownMenuItemState,
  ctx: DropdownMenuItemStyleContext,
): DropdownMenuItemStyle {
  switch (state) {
    case "hover":
      return { background: ctx.hoverBg, labelColor: ctx.idleFg, scale: 1 };
    case "press":
      return { background: ctx.pressBg, labelColor: ctx.idleFg, scale: 0.98 };
    default:
      return { background: ctx.idleBg, labelColor: ctx.idleFg, scale: 1 };
  }
}

/** Default row width (px) — matches the dropdown-menu panel. */
const ROW_WIDTH = 240;

export interface DropdownMenuItemRowProps {
  /** Resolved animated visual (smooth path); takes precedence over `state`. */
  style?: DropdownMenuItemStyle;
  /** Current visual state (snap path). */
  state?: DropdownMenuItemState;
  label?: string;
  /** Row width in px. */
  width?: number;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
}

/**
 * INLINE option row — no full-frame wrapper. Renders one menu row: padding
 * `8px 12px`, `borderRadius: theme.radius - 2`, label left. This is the shared
 * visual that `DropdownMenu` reuses for its panel rows.
 */
export function DropdownMenuItemRow({
  style,
  state = "idle",
  label = "Profile",
  width = ROW_WIDTH,
  theme: themeOverride,
  mode,
}: DropdownMenuItemRowProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = dropdownMenuItemStyleContext(theme);
  const v = style ?? dropdownMenuItemStyle(state, ctx);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width,
        padding: "8px 12px",
        borderRadius: theme.radius - 2,
        background: v.background,
        color: v.labelColor,
        transform: `scale(${v.scale})`,
        fontSize: 14,
        letterSpacing: "-0.01em",
        boxSizing: "border-box",
      }}
    >
      <span>{label}</span>
    </div>
  );
}

export interface DropdownMenuItemProps extends DropdownMenuItemRowProps {
  className?: string;
}

/**
 * The standalone registered atom — resolves theme/ctx/style then wraps
 * `<DropdownMenuItemRow>` in the standard full-frame centering wrapper. This is
 * what the registry registers and the customizer mounts.
 */
export function DropdownMenuItem({
  style,
  state = "idle",
  label = "Profile",
  width = ROW_WIDTH,
  theme: themeOverride,
  mode,
  className,
}: DropdownMenuItemProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.background,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <DropdownMenuItemRow
        style={style}
        state={state}
        label={label}
        width={width}
        theme={themeOverride}
        mode={mode}
      />
    </div>
  );
}
