import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return {
    ...actual,
    useCurrentFrame: vi.fn().mockReturnValue(0),
    useVideoConfig: vi.fn().mockReturnValue({
      fps: 30,
      durationInFrames: 90,
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
    Easing: actual.Easing,
  };
});

import type React from "react";
import {
  presentation,
  StaggeredFadeUp,
  staggeredFadeUpSchema,
} from "./staggered-fade-up";

describe("StaggeredFadeUp — schema validation", () => {
  it("parses default values correctly", () => {
    const result = staggeredFadeUpSchema.parse({
      words: ["Hello", "World"],
    });
    expect(result.staggerFrames).toBe(8);
    expect(result.riseDistance).toBe(24);
    expect(result.easing).toBe("literary");
  });

  it("rejects staggerFrames below minimum (2)", () => {
    expect(() =>
      staggeredFadeUpSchema.parse({
        words: ["a", "b"],
        staggerFrames: 1,
      }),
    ).toThrow();
  });

  it("rejects staggerFrames above maximum (30)", () => {
    expect(() =>
      staggeredFadeUpSchema.parse({
        words: ["a", "b"],
        staggerFrames: 31,
      }),
    ).toThrow();
  });

  it("rejects riseDistance above maximum (80)", () => {
    expect(() =>
      staggeredFadeUpSchema.parse({
        words: ["a"],
        riseDistance: 81,
      }),
    ).toThrow();
  });
});

describe("StaggeredFadeUp — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with default props", () => {
    const { container } = render(
      <StaggeredFadeUp words={["The", "future", "is", "written"]} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with easing=snappy", () => {
    const { container } = render(
      <StaggeredFadeUp
        words={["Fast", "entry"]}
        staggerFrames={4}
        riseDistance={16}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders single-word array", () => {
    const { container } = render(
      <StaggeredFadeUp
        words={["Solo"]}
        staggerFrames={8}
        riseDistance={24}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders all words as spans in the DOM", () => {
    const words = ["One", "Two", "Three"];
    const { container } = render(<StaggeredFadeUp words={words} />);
    const spans = container.querySelectorAll("span");
    // 3 word spans
    expect(spans.length).toBeGreaterThanOrEqual(words.length);
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("staggered-fade-up");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/staggered-fade-up.tsx",
    );
  });
});
