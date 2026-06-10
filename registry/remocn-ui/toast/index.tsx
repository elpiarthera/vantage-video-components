"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type ToastState = "hidden" | "visible";

export type ToastVariant = "default" | "success" | "error";

export interface ToastProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: ToastState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `ToastStyle` from `useToastTransition`.
   */
  style?: ToastStyle;
  title: string;
  description?: string;
  /** Changes the leading icon and its color. `default` shows a neutral info dot. */
  variant?: ToastVariant;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

const TOAST_WIDTH = 356;

export interface ToastStyle {
  /** Whole-toast opacity 0→1. */
  opacity: number;
  /** Enter offset in px (+16 below rest → 0 at rest). */
  translateY: number;
  /** Enter scale (0.97 → 1). */
  scale: number;
}

/** Concrete per-variant visuals, resolved once per render. */
export interface ToastStyleContext {
  /** Leading icon color for the active variant (a concrete color). */
  iconColor: string;
}

/**
 * Derive the concrete per-variant colors for a theme. Pure — `success`/`error`
 * tint the icon; `default` uses the muted foreground.
 */
export function toastStyleContext(
  variant: ToastVariant,
  theme: RemocnTheme,
): ToastStyleContext {
  if (variant === "success") return { iconColor: "oklch(0.6 0.17 150)" };
  if (variant === "error") return { iconColor: theme.destructive };
  return { iconColor: theme.mutedForeground };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state) => ToastStyle` map.
 * Both presets are full keyframes; the toast enters from 16px below at 0.97
 * scale and rests at 0/1. To change how a state looks, edit one entry.
 */
export function toastStyle(state: ToastState): ToastStyle {
  switch (state) {
    case "visible":
      return { opacity: 1, translateY: 0, scale: 1 };
    default:
      return { opacity: 0, translateY: 16, scale: 0.97 };
  }
}

function ToastIcon({
  variant,
  color,
}: {
  variant: ToastVariant;
  color: string;
}) {
  if (variant === "success") {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
        <path
          d="M8 12.5l2.6 2.6L16 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
        <path
          d="M12 7.5v5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.1" fill={color} />
      </svg>
    );
  }
  // default — neutral info circle.
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 11v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.1" fill={color} />
    </svg>
  );
}

/**
 * A deterministic toast. Pure renderer of whatever `ToastStyle` it receives — it
 * reads no frame, holds no state, runs no effects. Snap (`state`) and smooth
 * (`style`) share one render path. Placement (e.g. bottom-right) is the caller's
 * job; the toast renders inside a transparent wrapper.
 */
export function Toast({
  state = "hidden",
  style,
  title,
  description,
  variant = "default",
  theme: themeOverride,
  mode,
  className,
}: ToastProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = toastStyleContext(variant, theme);
  const v = style ?? toastStyle(state);

  return (
    <div
      className={className}
      style={{
        display: "flex",

        alignItems: description ? "flex-start" : "center",
        gap: 12,
        width: TOAST_WIDTH,
        padding: "16px",
        background: theme.popover,
        color: theme.popoverForeground,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        opacity: v.opacity,
        transform: `translateY(${v.translateY}px) scale(${v.scale})`,
        transformOrigin: "bottom center",
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // flexShrink: 0,
          // Nudge the icon onto the title's optical line when stacked.
          marginTop: description ? 1 : 0,
        }}
      >
        <ToastIcon variant={variant} color={ctx.iconColor} />
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
        {description !== undefined && (
          <span
            style={{
              fontSize: 13,
              lineHeight: 1.4,
              color: theme.mutedForeground,
            }}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
