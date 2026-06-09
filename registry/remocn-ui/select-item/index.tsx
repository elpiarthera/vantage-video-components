"use client";

import { mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type SelectItemState = "idle" | "hover" | "press" | "selected";

export interface SelectItemProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: SelectItemState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `SelectItemStyle` from `useSelectItemTransition`.
   */
  style?: SelectItemStyle;
  /** Option text. */
  label?: string;
  /** Row width (px). Matches the panel width when composed in `Select`. */
  width?: number;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Standalone row width (px) when the atom is mounted on its own. */
const ROW_WIDTH = 260;

// ===========================================================================
// Select-item visual — the COMPLETE animated look for a moment in time. A
// `state` is a named preset of this visual (`selectItemStyle`); the smooth path
// feeds an interpolated `SelectItemStyle` straight through. The component is a
// pure renderer of whichever `SelectItemStyle` it receives.
// ===========================================================================

export interface SelectItemStyle {
  /** Animated row background (a concrete color, never "transparent"). */
  background: string;
  /** Animated label color. */
  labelColor: string;
  /** Check-icon opacity: 0 unless `selected` → 1. */
  checkOpacity: number;
  /** Row zoom: 1 default, 0.98 on press. */
  scale: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface SelectItemStyleContext {
  idleBg: string;
  hoverBg: string;
  pressBg: string;
  selectedBg: string;
  idleFg: string;
  selectedFg: string;
  check: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `selectItemStyle(state, ctx)` preset.
 */
export function selectItemStyleContext(
  theme: RemocnTheme,
): SelectItemStyleContext {
  return {
    idleBg: theme.popover,
    hoverBg: theme.accent,
    pressBg: mixOklch(theme.accent, theme.foreground, 0.08),
    selectedBg: theme.accent,
    idleFg: theme.popoverForeground,
    selectedFg: theme.accentForeground,
    check: theme.primary,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => SelectItemStyle`
 * map. To change how a state looks, edit one entry.
 */
export function selectItemStyle(
  state: SelectItemState,
  ctx: SelectItemStyleContext,
): SelectItemStyle {
  switch (state) {
    case "hover":
      return {
        background: ctx.hoverBg,
        labelColor: ctx.idleFg,
        checkOpacity: 0,
        scale: 1,
      };
    case "press":
      return {
        background: ctx.pressBg,
        labelColor: ctx.idleFg,
        checkOpacity: 0,
        scale: 0.98,
      };
    case "selected":
      return {
        background: ctx.selectedBg,
        labelColor: ctx.selectedFg,
        checkOpacity: 1,
        scale: 1,
      };
    default:
      return {
        background: ctx.idleBg,
        labelColor: ctx.idleFg,
        checkOpacity: 0,
        scale: 1,
      };
  }
}

/** Props for the inline row — the shared visual that `Select` reuses. */
export interface SelectItemRowProps {
  /** Resolved animated visual (smooth path); wins over `state` when present. */
  style?: SelectItemStyle;
  /** Current visual state (snap path) when no `style` is supplied. */
  state?: SelectItemState;
  /** Pre-derived ctx (the container passes its shared one to avoid re-resolving). */
  ctx: SelectItemStyleContext;
  label: string;
  width: number;
  /** Row corner radius (px). */
  radius: number;
  /** Check-icon color. */
  check: string;
}

/**
 * INLINE option row — no full-frame wrapper. One row of a select panel: label
 * left, check icon right (opacity from style). The `Select` container renders a
 * column of these; the standalone `SelectItem` wraps one in a centering frame.
 */
export function SelectItemRow({
  style,
  state = "idle",
  ctx,
  label,
  width,
  radius,
  check,
}: SelectItemRowProps) {
  const v = style ?? selectItemStyle(state, ctx);
  return (
    <div
      className={undefined}
      style={{
        width,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 12px",
        borderRadius: radius,
        transform: `scale(${v.scale})`,
        background: v.background,
        color: v.labelColor,
        fontSize: 14,
        letterSpacing: "-0.01em",
      }}
    >
      <span>{label}</span>
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0, opacity: v.checkOpacity }}
      >
        <path
          d="M5 12.5l4.5 4.5L19 7"
          stroke={check}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Standalone option-row atom — resolves theme/ctx/style then wraps a single
 * `<SelectItemRow>` in the standard full-frame centering wrapper. THIS is what
 * the registry registers and the customizer mounts. The `Select` container does
 * NOT use this — it reuses `SelectItemRow` directly inside its panel.
 */
export function SelectItem({
  state = "idle",
  style,
  label = "Banana",
  width = ROW_WIDTH,
  theme: themeOverride,
  mode,
  className,
}: SelectItemProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = selectItemStyleContext(theme);

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
      <SelectItemRow
        style={style}
        state={state}
        ctx={ctx}
        label={label}
        width={width}
        radius={theme.radius - 2}
        check={ctx.check}
      />
    </div>
  );
}
