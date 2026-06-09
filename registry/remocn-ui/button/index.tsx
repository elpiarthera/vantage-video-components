"use client";

import { interpolate, useCurrentFrame } from "remotion";
import {
  mixOklch,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useTimelineState,
} from "@/lib/remocn-ui";

export type ButtonAction =
  | "hover"
  | "press"
  | "release"
  | "loading"
  | "success"
  | "reset";

export type ButtonPhase =
  | "idle"
  | "hover"
  | "press"
  | "loading"
  | "success"
  | "error";

export type ButtonScenario = "happy" | "loading" | "error" | "idle";

type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

type ButtonSize = "sm" | "default" | "lg";

interface ButtonState {
  phase: ButtonPhase;
}

export interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  steps?: Step<ButtonAction>[];
  theme?: Partial<RemocnTheme>;
  /** Convenience override for the `primary` theme token — merged into `theme`. */
  primary?: string;
  mode?: "light" | "dark";
  scenario?: ButtonScenario;
  speed?: number;
  className?: string;
}

/**
 * The single source of truth for the preview scenarios. The component resolves
 * `scenario`→steps when `steps` is absent; `config.snippet` imports this map to
 * emit the `steps={[…]}` literal — so component and snippet never drift.
 */
export const BUTTON_SCENARIOS: Record<ButtonScenario, Step<ButtonAction>[]> = {
  happy: [
    { at: 10, action: "hover" },
    { at: 25, action: "press" },
    { at: 35, action: "loading" },
    { at: 70, action: "success" },
  ],
  loading: [{ at: 10, action: "loading" }],
  error: [
    { at: 10, action: "hover" },
    { at: 25, action: "press" },
    { at: 35, action: "loading" },
    { at: 70, action: "reset" },
  ],
  idle: [],
};

const DEFAULT_STATE: ButtonState = { phase: "idle" };

const DURATION_DEFAULTS: Record<ButtonAction, number> = {
  hover: 8,
  press: 5,
  release: 6,
  loading: 10,
  success: 14,
  reset: 8,
};

function reducer(state: ButtonState, step: Step<ButtonAction>): ButtonState {
  switch (step.action) {
    case "hover":
      return { phase: "hover" };
    case "press":
      return { phase: "press" };
    case "release":
      return { phase: "hover" };
    case "loading":
      return { phase: "loading" };
    case "success":
      return { phase: "success" };
    case "reset":
      // `reset` animates a destructive flash IN-FLIGHT (read via isActiveReset),
      // then settles to idle. Settled truth = idle, not error.
      return { phase: "idle" };
    default:
      return state;
  }
}

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; padding: string; fontSize: number; gap: number }
> = {
  sm: { height: 32, padding: "0 12px", fontSize: 13, gap: 6 },
  default: { height: 40, padding: "0 20px", fontSize: 15, gap: 8 },
  lg: { height: 48, padding: "0 28px", fontSize: 17, gap: 10 },
};

interface VariantTokens {
  bg: string;
  fg: string;
  hoverBg: string;
  border: string;
}

function variantTokens(
  variant: ButtonVariant,
  theme: RemocnTheme,
): VariantTokens {
  switch (variant) {
    case "secondary":
      return {
        bg: theme.secondary,
        fg: theme.secondaryForeground,
        hoverBg: mixOklch(theme.secondary, theme.muted, 1),
        border: "transparent",
      };
    case "destructive":
      return {
        bg: theme.destructive,
        fg: theme.destructiveForeground,
        hoverBg: mixOklch(theme.destructive, theme.foreground, 0.12),
        border: "transparent",
      };
    case "outline":
      return {
        bg: "transparent",
        fg: theme.foreground,
        hoverBg: theme.accent,
        border: theme.border,
      };
    case "ghost":
      return {
        bg: "transparent",
        fg: theme.foreground,
        hoverBg: theme.accent,
        border: "transparent",
      };
    default:
      return {
        bg: theme.primary,
        fg: theme.primaryForeground,
        hoverBg: mixOklch(theme.primary, theme.foreground, 0.1),
        border: "transparent",
      };
  }
}

export function Button({
  label = "Continue",
  variant = "default",
  size = "default",
  steps,
  theme: themeOverride,
  primary,
  mode,
  scenario = "idle",
  speed = 1,
  className,
}: ButtonProps) {
  const frame = useCurrentFrame();
  const theme = useRemocnTheme(
    { ...themeOverride, ...(primary ? { primary } : {}) },
    mode,
  );

  const resolvedSteps = steps ?? BUTTON_SCENARIOS[scenario];

  const { state, active, progressOf } = useTimelineState<ButtonState, ButtonAction>(
    resolvedSteps,
    DEFAULT_STATE,
    reducer,
    DURATION_DEFAULTS,
    speed,
  );

  const sizeStyle = SIZE_STYLES[size];
  const tokens = variantTokens(variant, theme);

  // --- Concurrent animation tracks (in-flight only) ---
  const hoverP = progressOf("hover");
  const pressP = progressOf("press");
  const loadingP = progressOf("loading");
  const successP = progressOf("success");
  const resetP = progressOf("reset");

  // --- Settled truth comes from state.phase (never from a closed progressOf) ---
  const isHoverPhase =
    state.phase === "hover" ||
    state.phase === "press" ||
    state.phase === "loading" ||
    state.phase === "success";
  const isPressPhase = state.phase === "press";
  const isLoadingPhase = state.phase === "loading";
  const isSuccessPhase = state.phase === "success";

  // Whether the reset window is currently in-flight (progressOf is in-flight-only;
  // use the active array for the gate so the flash only exists during the window).
  const isActiveReset = active.some((a) => a.step.action === "reset");

  // Hover lift + bg crossfade. Settled hover level holds at 1 once hovered.
  const hoverLevel = isHoverPhase ? 1 : 0;
  const hoverMix = Math.max(hoverLevel, hoverP);
  const translateY = interpolate(hoverMix, [0, 1], [0, -1]);

  // Press scale + darken. Settled at 0.97 while in press phase.
  const pressLevel = isPressPhase ? 1 : 0;
  const pressMix = Math.max(pressLevel, pressP);
  const scale = interpolate(pressMix, [0, 1], [1, 0.97]);

  // Loading: label fades out, spinner fades in. Settled fully on in loading.
  const loadingLevel = isLoadingPhase || isSuccessPhase ? 1 : 0;
  const loadingMix = Math.max(loadingLevel, loadingP);

  // Success: spinner fades out, checkmark draws. Settled fully on in success.
  const successLevel = isSuccessPhase ? 1 : 0;
  const successMix = Math.max(successLevel, successP);

  // Error flash on reset: IN-FLIGHT ONLY. Peaks at the start of the reset window
  // (resetP=0 → full destructive) and fades back to base (resetP=1 → no flash).
  // After the window closes isActiveReset is false → errorFlash=0, button is idle.
  const errorFlash = isActiveReset ? 1 - resetP : 0;

  // --- Resolve background ---
  let background = tokens.bg;
  if (isActiveReset) {
    // destructive flash, easing back to base bg as reset window completes
    background =
      tokens.bg === "transparent"
        ? mixOklch(theme.background, theme.destructive, errorFlash)
        : mixOklch(tokens.bg, theme.destructive, errorFlash);
  } else if (isSuccessPhase) {
    // success settles bg to primary
    background = mixOklch(tokens.bg, theme.primary, successMix);
  } else if (tokens.bg === "transparent") {
    // outline / ghost: fade in the accent bg on hover
    background = mixOklch(theme.background, tokens.hoverBg, hoverMix);
  } else {
    const hovered = mixOklch(tokens.bg, tokens.hoverBg, hoverMix);
    // press darkens further toward foreground
    background = mixOklch(hovered, theme.foreground, pressMix * 0.08);
  }

  const labelOpacity = interpolate(loadingMix, [0, 1], [1, 0]);
  const spinnerOpacity = Math.min(
    interpolate(loadingMix, [0, 1], [0, 1]),
    interpolate(successMix, [0, 1], [1, 0]),
  );
  const checkOpacity = interpolate(successMix, [0, 1], [0, 1]);

  // Deterministic spinner rotation (no Date/RAF) — scaled by the same playhead.
  const spinnerRotation = frame * speed * 6;

  // Checkmark stroke draw via dash offset (path length ~ 14 units).
  const checkPathLength = 14;
  const checkDashOffset = interpolate(
    successMix,
    [0, 1],
    [checkPathLength, 0],
  );

  const showSpinner = loadingMix > 0 || successMix > 0;
  const iconSize = Math.round(sizeStyle.fontSize * 1.1);

  return (
    <div
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
      <button
        type="button"
        className={className}
        style={{
          position: "relative",
          transform: `translateY(${translateY}px) scale(${scale})`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: sizeStyle.gap,
          height: sizeStyle.height,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: tokens.fg,
          background,
          border:
            variant === "outline"
              ? `1px solid ${tokens.border}`
              : "1px solid transparent",
          borderRadius: theme.radius,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {showSpinner && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Spinner */}
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  position: "absolute",
                  opacity: spinnerOpacity,
                  transform: `rotate(${spinnerRotation}deg)`,
                }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke={tokens.fg}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="44"
                  strokeDashoffset="33"
                  opacity={0.9}
                />
              </svg>
              {/* Checkmark */}
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                style={{ position: "absolute", opacity: checkOpacity }}
              >
                <path
                  d="M5 12.5l4.5 4.5L19 7"
                  stroke={tokens.fg}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={checkPathLength}
                  strokeDashoffset={checkDashOffset}
                  pathLength={checkPathLength}
                />
              </svg>
            </span>
          )}
          <span style={{ opacity: labelOpacity }}>{label}</span>
        </span>
      </button>
    </div>
  );
}
