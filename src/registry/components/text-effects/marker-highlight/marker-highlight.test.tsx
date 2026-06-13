import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return {
    ...actual,
    useCurrentFrame: vi.fn().mockReturnValue(0),
    useVideoConfig: vi.fn().mockReturnValue({
      fps: 30,
      durationInFrames: 60,
      width: 1080,
      height: 1920,
      id: "test",
    }),
    AbsoluteFill: ({
      children,
      style,
    }: {
      children?: React.ReactNode;
      style?: React.CSSProperties;
    }) => (
      <div data-testid="absolute-fill" style={style}>
        {children}
      </div>
    ),
    interpolate: actual.interpolate,
    interpolateColors: actual.interpolateColors,
    Easing: actual.Easing,
  };
});

import type React from "react";
import {
  MarkerHighlight,
  markerHighlightSchema,
  presentation,
} from "./marker-highlight";

describe("MarkerHighlight — schema validation", () => {
  it("parses default values correctly", () => {
    const result = markerHighlightSchema.parse({
      text: "The future is now",
      highlightWord: "future",
    });
    expect(result.markerColor).toBe("oklch(0.74 0.16 60 / 0.35)");
    expect(result.textShiftColor).toBe("#0a0a0a");
    expect(result.drawFrames).toBe(18);
    expect(result.easing).toBe("literary");
  });

  it("rejects drawFrames below minimum (8)", () => {
    expect(() =>
      markerHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        drawFrames: 7,
      }),
    ).toThrow();
  });

  it("rejects drawFrames above maximum (40)", () => {
    expect(() =>
      markerHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        drawFrames: 41,
      }),
    ).toThrow();
  });

  it("rejects invalid easing value", () => {
    expect(() =>
      markerHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        easing: "spring",
      }),
    ).toThrow();
  });
});

describe("MarkerHighlight — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with default props", () => {
    const { container } = render(
      <MarkerHighlight text="The future is written" highlightWord="future" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with easing=snappy", () => {
    const { container } = render(
      <MarkerHighlight
        text="Quick mark"
        highlightWord="mark"
        easing="snappy"
        drawFrames={10}
        markerColor="rgba(245,158,11,0.35)"
        textShiftColor="#0a0a0a"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders when highlightWord is not present in text", () => {
    const { container } = render(
      <MarkerHighlight
        text="Hello world"
        highlightWord="missing"
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with custom startFrame", () => {
    const { container } = render(
      <MarkerHighlight
        text="Delayed reveal"
        highlightWord="reveal"
        startFrame={20}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders aria-hidden marker span", () => {
    const { container } = render(
      <MarkerHighlight
        text="Accessible content"
        highlightWord="Accessible"
        easing="literary"
      />,
    );
    const markerSpan = container.querySelector('[aria-hidden="true"]');
    expect(markerSpan).not.toBeNull();
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("marker-highlight");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/marker-highlight.tsx",
    );
  });
});
