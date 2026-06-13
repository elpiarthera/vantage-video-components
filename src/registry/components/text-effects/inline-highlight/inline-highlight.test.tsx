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
  InlineHighlight,
  inlineHighlightSchema,
  presentation,
} from "./inline-highlight";

describe("InlineHighlight — schema validation", () => {
  it("parses default values correctly", () => {
    const result = inlineHighlightSchema.parse({
      text: "The future is now",
      highlightWord: "future",
    });
    expect(result.fromColor).toBe("oklch(0.78 0.02 80)");
    expect(result.toColor).toBe("#f59e0b");
    expect(result.durationFrames).toBe(24);
    expect(result.easing).toBe("literary");
  });

  it("rejects durationFrames below minimum (8)", () => {
    expect(() =>
      inlineHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        durationFrames: 7,
      }),
    ).toThrow();
  });

  it("rejects durationFrames above maximum (60)", () => {
    expect(() =>
      inlineHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        durationFrames: 61,
      }),
    ).toThrow();
  });

  it("rejects invalid easing value", () => {
    expect(() =>
      inlineHighlightSchema.parse({
        text: "test",
        highlightWord: "test",
        easing: "bounce",
      }),
    ).toThrow();
  });
});

describe("InlineHighlight — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with defaults", () => {
    const { container } = render(
      <InlineHighlight text="The future is now" highlightWord="future" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with easing=snappy", () => {
    const { container } = render(
      <InlineHighlight
        text="Only one answer"
        highlightWord="one"
        easing="snappy"
        durationFrames={20}
        fromColor="#9ca3af"
        toColor="#f59e0b"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders when highlightWord is not found in text", () => {
    const { container } = render(
      <InlineHighlight
        text="Hello world"
        highlightWord="missing"
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with custom startFrame", () => {
    const { container } = render(
      <InlineHighlight
        text="Start later"
        highlightWord="later"
        startFrame={15}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("inline-highlight");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/inline-highlight.tsx",
    );
  });
});
