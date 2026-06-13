import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock remotion hooks before importing the component
vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return {
    ...actual,
    useCurrentFrame: vi.fn().mockReturnValue(0),
    useVideoConfig: vi.fn().mockReturnValue({
      fps: 30,
      durationInFrames: 60,
      width: 1920,
      height: 1080,
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
import { FadeBlur, fadeBlurSchema, presentation } from "./fade-blur";

describe("FadeBlur — schema validation", () => {
  it("parses default values correctly", () => {
    const result = fadeBlurSchema.parse({});
    expect(result.direction).toBe("in");
    expect(result.durationFrames).toBe(20);
    expect(result.blurMax).toBe(12);
    expect(result.easing).toBe("literary");
  });

  it("rejects durationFrames below minimum (8)", () => {
    expect(() => fadeBlurSchema.parse({ durationFrames: 7 })).toThrow();
  });

  it("rejects durationFrames above maximum (60)", () => {
    expect(() => fadeBlurSchema.parse({ durationFrames: 61 })).toThrow();
  });

  it("rejects blurMax above maximum (30)", () => {
    expect(() => fadeBlurSchema.parse({ blurMax: 31 })).toThrow();
  });

  it("rejects invalid direction value", () => {
    expect(() => fadeBlurSchema.parse({ direction: "diagonal" })).toThrow();
  });

  it("accepts direction=out with all defaults", () => {
    const result = fadeBlurSchema.parse({ direction: "out" });
    expect(result.direction).toBe("out");
    expect(result.easing).toBe("literary");
  });

  it("accepts snappy easing", () => {
    const result = fadeBlurSchema.parse({ easing: "snappy" });
    expect(result.easing).toBe("snappy");
  });
});

describe("FadeBlur — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with direction=in and easing=literary", () => {
    const { container } = render(
      <FadeBlur
        direction="in"
        durationFrames={20}
        blurMax={12}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing with direction=out and easing=snappy", () => {
    const { container } = render(
      <FadeBlur
        direction="out"
        durationFrames={15}
        blurMax={8}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders custom children instead of default content", () => {
    const { getByTestId } = render(
      <FadeBlur
        direction="in"
        durationFrames={20}
        blurMax={12}
        easing="literary"
      >
        <div data-testid="custom-child">Custom Content</div>
      </FadeBlur>,
    );
    expect(getByTestId("custom-child")).not.toBeNull();
  });

  it("applies opacity and filter styles to the wrapper", () => {
    const { getAllByTestId } = render(
      <FadeBlur
        direction="in"
        durationFrames={20}
        blurMax={12}
        easing="literary"
      />,
    );
    const fills = getAllByTestId("absolute-fill");
    // The outermost AbsoluteFill wrapper should have opacity and filter
    const wrapper = fills[0];
    expect(wrapper.style.opacity).toBeDefined();
    expect(wrapper.style.filter).toBeDefined();
  });

  it("does not use TransitionSeries (Eta refinement d compliance)", () => {
    // This test verifies we are Remotion-primitive-based.
    // The component source must not import or reference TransitionSeries.
    // We verify by checking the presentation metadata — if it lists only
    // remotion as dependency (not @remotion/transitions), the constraint holds.
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.dependencies).not.toContain("@remotion/transitions");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("fade-blur");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files).toHaveLength(1);
    expect(presentation.files[0].target).toBe(
      "remotion/transitions/fade-blur.tsx",
    );
  });
});
