"use client";

import { useCurrentFrame } from "remotion";
import {
  clamp01,
  type EasingName,
  easings,
} from "@/lib/remocn-ui";
import type { CursorStyle } from "@/components/remocn/cursor";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/**
 * A scripted point the cursor moves to. The cursor eases from the previous
 * waypoint's position to this one over `[at, at + (duration ?? DEFAULT_DURATION))`.
 */
export interface CursorWaypoint {
  /** LOCAL (Sequence-relative) authored frame the cursor finishes arriving here. */
  at: number;
  /** Tip X in px (parent-relative). */
  x: number;
  /** Tip Y in px (parent-relative). */
  y: number;
  /** Frames the move INTO this waypoint takes. Omitted → DEFAULT_DURATION. */
  duration?: number;
  /** Fire a click on arrival: a ripple (~CLICK_FRAMES) + a brief press dip. */
  click?: boolean;
  /** Hold the pressed look from this waypoint until the next one (drag). */
  press?: boolean;
  /** Override the easing for the move into this waypoint. Default `inOut`. */
  easing?: EasingName;
}

/** Default frames for a move into a waypoint when it omits `duration`. */
export const DEFAULT_DURATION = 24;

/** Frames a click ripple takes to scale up and fully fade out. */
export const CLICK_FRAMES = 16;

/** Frames the cursor's click press-dip lasts (a quick down-and-up). */
export const PRESS_FRAMES = 8;

export interface CursorPathOptions {
  /** Playhead scale (effectiveFrame = useCurrentFrame() * speed). */
  speed?: number;
  /** Move duration (frames) when a waypoint omits `duration`. */
  defaultDuration?: number;
}

/** Linear blend; numeric channels only. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * The ripple's opacity + scale for `framesSinceClick` into a click. Pure preset
 * of the click phase: scale ramps 0 → ~2.5 (eased out), opacity 0.5 → 0. Past
 * CLICK_FRAMES the ripple is fully gone. Exported for the pure-surface tests.
 */
export function ripplePhase(framesSinceClick: number): {
  rippleOpacity: number;
  rippleScale: number;
} {
  if (framesSinceClick < 0 || framesSinceClick >= CLICK_FRAMES) {
    return { rippleOpacity: 0, rippleScale: 0 };
  }
  const p = clamp01(framesSinceClick / CLICK_FRAMES);
  return {
    rippleOpacity: 0.5 * (1 - p),
    rippleScale: 2.5 * easings.out(p),
  };
}

/**
 * The momentary click press-dip for `framesSinceClick` into a click: dips
 * 1 → 0 → 1 over PRESS_FRAMES (a quick down-and-up), then holds at 1. Returned
 * as `pressScale` (1 = up, 0 = fully pressed). Pure; exported for tests.
 */
export function clickPress(framesSinceClick: number): number {
  if (framesSinceClick < 0 || framesSinceClick >= PRESS_FRAMES) return 1;
  const half = PRESS_FRAMES / 2;
  const p =
    framesSinceClick < half
      ? framesSinceClick / half // down
      : 1 - (framesSinceClick - half) / half; // up
  return 1 - clamp01(p);
}

/**
 * Resolve the cursor's `CursorStyle` for a path of waypoints. THIS is the only
 * frame-reading file in the component — `<Cursor>` itself stays pure. Mirrors
 * the value-channel deviation: instead of a string-state timeline it folds a
 * numeric position path plus click/press phases.
 *
 * The fold is a pure function of `raw = useCurrentFrame() * speed`; the tests
 * replicate `cursorPathAt(waypoints, raw, opts)` with the frame injected.
 */
export function useCursorPath(
  waypoints: CursorWaypoint[],
  opts: CursorPathOptions = {},
): CursorStyle {
  const { speed = 1 } = opts;
  const raw = useCurrentFrame() * speed;
  return cursorPathAt(waypoints, raw, opts);
}

/**
 * Pure core of `useCursorPath` with the effective frame injected as `raw`. Kept
 * separate so it can be unit-tested without a Remotion render. `useCursorPath`
 * is exactly `cursorPathAt(waypoints, useCurrentFrame() * speed, opts)`.
 */
export function cursorPathAt(
  waypoints: CursorWaypoint[],
  raw: number,
  opts: CursorPathOptions = {},
): CursorStyle {
  const { defaultDuration = DEFAULT_DURATION } = opts;

  if (waypoints.length === 0) {
    return { x: 0, y: 0, scale: 1, rippleOpacity: 0, rippleScale: 0 };
  }

  // Authored order is the path order; `at` is the arrival frame of each point.
  const first = waypoints[0];

  // Before the first arrival, the cursor waits parked at the first waypoint.
  if (raw <= first.at) {
    return {
      x: first.x,
      y: first.y,
      scale: 1,
      rippleOpacity: 0,
      rippleScale: 0,
      pressScale: 1,
    };
  }

  // Find the segment we're in: the move from waypoint i-1 into waypoint i, where
  // i is the first waypoint with at > raw. If none, we're resting at the last.
  let toIndex = waypoints.length - 1;
  for (let i = 1; i < waypoints.length; i++) {
    if (waypoints[i].at > raw) {
      toIndex = i;
      break;
    }
  }
  // If raw is past the last arrival, hold at the last waypoint.
  const pastLast = raw >= waypoints[waypoints.length - 1].at;
  const to = pastLast ? waypoints[waypoints.length - 1] : waypoints[toIndex];
  const from = pastLast
    ? waypoints[waypoints.length - 1]
    : waypoints[toIndex - 1];

  const dur = to.duration ?? defaultDuration;
  const ease = easings[to.easing ?? "inOut"];
  // The move runs over [start, to.at); start = to.at - dur.
  const start = to.at - dur;
  const t = pastLast || dur <= 0 ? 1 : ease(clamp01((raw - start) / dur));
  const x = lerp(from.x, to.x, t);
  const y = lerp(from.y, to.y, t);

  // Click visuals: ripple + press-dip start at the arrival of any waypoint with
  // `click`. Find the most recent such arrival at or before `raw`.
  let lastClickAt = -Infinity;
  for (const wp of waypoints) {
    if (wp.click && wp.at <= raw && wp.at > lastClickAt) lastClickAt = wp.at;
  }
  const sinceClick = lastClickAt === -Infinity ? -1 : raw - lastClickAt;
  const ripple = ripplePhase(sinceClick);
  const clickDip = clickPress(sinceClick);

  // Held press (drag): the segment we're resting at / arrived from is `pressed`
  // when the waypoint that STARTED the current hold has `press: true`. We hold
  // the look from a `press` waypoint's arrival until the next waypoint arrives.
  const holdWp = pastLast ? waypoints[waypoints.length - 1] : from;
  const heldPress = holdWp.press ? 0 : 1;

  // Combine the momentary click dip with the held drag press (min = most down).
  const pressScale = Math.min(clickDip, heldPress);

  return {
    x,
    y,
    scale: 1,
    rippleOpacity: ripple.rippleOpacity,
    rippleScale: ripple.rippleScale,
    pressScale,
  };
}
