"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type CursorVariant = "arrow" | "pointer";

// ===========================================================================
// Cursor visual — the COMPLETE animated look for a moment in time. The animated
// channel here is numeric (position + ripple phase), the accepted value-channel
// deviation from the string-`state` atoms (see STYLE-GUIDE §"value channel"):
// `useCursorPath` feeds an interpolated `CursorStyle` straight through, exactly
// like `style` on a state atom. The component is a pure renderer — it never
// reads the frame.
// ===========================================================================

export interface CursorStyle {
  /** Tip X in px, relative to the absolute wrapper's parent. */
  x: number;
  /** Tip Y in px, relative to the absolute wrapper's parent. */
  y: number;
  /** Cursor scale (1 = rest). A click dips this toward `pressScale` briefly. */
  scale: number;
  /** Ripple circle opacity (0 = gone). */
  rippleOpacity: number;
  /** Ripple circle scale (0 → ~2.5 over a click). */
  rippleScale: number;
  /**
   * Held press visual (1 = up, 0 = fully pressed). Drives the press dip while a
   * `press` segment (drag) is held; `useCursorPath` blends it with the click dip.
   */
  pressScale?: number;
}

export interface CursorProps {
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * the resting `style` defaults — feed it an interpolated `CursorStyle` from
   * `useCursorPath`.
   */
  style?: CursorStyle;
  /** macOS arrow or hand pointer. Static choice, not animated. */
  variant?: CursorVariant;
  /** Rendered cursor height in px (the SVG scales to it). Default 28. */
  size?: number;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  /** Ripple ring color. Defaults to `theme.primary`. */
  rippleColor?: string;
  className?: string;
}

/** The resting visual when no `style` is supplied (cursor parked at origin). */
const REST: CursorStyle = {
  x: 0,
  y: 0,
  scale: 1,
  rippleOpacity: 0,
  rippleScale: 0,
};

// Hand-drawn SVGs on a 24×24 grid; the tip (hotspot) sits at (0,0) so `x`/`y`
// position the pointing tip exactly, like a real cursor hotspot.
const ARROW_PATH =
  "M1 1 L1 18.5 L5.6 14.4 L8.7 21.6 L11.6 20.4 L8.5 13.2 L14.5 13.2 Z";
const POINTER_PATH =
  "M8 2.2 C8 1.3 8.7 0.7 9.5 0.7 C10.3 0.7 11 1.3 11 2.2 L11 9 " +
  "C11 9 11.3 8.4 12.2 8.4 C13 8.4 13.4 9 13.4 9.6 " +
  "C13.4 9.6 13.9 9.1 14.7 9.1 C15.5 9.1 15.9 9.7 15.9 10.3 " +
  "C15.9 10.3 16.4 9.9 17.1 9.9 C17.9 9.9 18.3 10.5 18.3 11.2 " +
  "L18.3 16.8 C18.3 19.8 16.3 22.3 12.8 22.3 L11.4 22.3 " +
  "C9 22.3 7.9 21.2 6.6 19.2 L4 15.2 C3.5 14.4 3.7 13.4 4.5 12.9 " +
  "C5.1 12.5 5.9 12.6 6.4 13.2 L8 15 Z";

/**
 * A deterministic animated cursor. Pure renderer of whatever `CursorStyle` it
 * receives — it reads no frame, holds no state, runs no effects. The single time
 * source is `useCursorPath`, on the caller's side; this component cannot tell
 * whether the `style` it got was a resting preset or an interpolated frame.
 */
export function Cursor({
  style,
  variant = "arrow",
  size = 28,
  theme: themeOverride,
  mode,
  rippleColor,
  className,
}: CursorProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const v = style ?? REST;

  // Press dips the cursor; click and held-press dips combine to one factor.
  const press = v.pressScale ?? 1;
  const pressedScale = v.scale * (0.9 + 0.1 * press);

  const ring = rippleColor ?? theme.primary;
  const fill = theme.foreground;
  const stroke = theme.background;
  // Ripple is centered on the cursor tip (the hotspot at the SVG origin).
  const rippleSize = size * 1.8;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${v.x}px, ${v.y}px)`,
        pointerEvents: "none",
      }}
    >
      {/* Ripple sits UNDER the tip and is centered on the hotspot. */}
      <div
        style={{
          position: "absolute",
          left: -rippleSize / 2,
          top: -rippleSize / 2,
          width: rippleSize,
          height: rippleSize,
          borderRadius: "50%",
          border: `2px solid ${ring}`,
          opacity: v.rippleOpacity,
          transform: `scale(${v.rippleScale})`,
          transformOrigin: "center",
        }}
      />
      {/* Cursor SVG, scaled about its tip so the hotspot stays anchored. */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `scale(${pressedScale})`,
          transformOrigin: "0 0",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
          overflow: "visible",
        }}
      >
        <path
          d={variant === "pointer" ? POINTER_PATH : ARROW_PATH}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
