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
import { presentation, SlideReveal, slideRevealSchema } from "./slide-reveal";

describe("SlideReveal — schema validation", () => {
  it("parses default values correctly", () => {
    const result = slideRevealSchema.parse({});
    expect(result.direction).toBe("left");
    expect(result.durationFrames).toBe(24);
    expect(result.distance).toBe(1);
    expect(result.easing).toBe("literary");
  });

  it("rejects durationFrames below minimum (8)", () => {
    expect(() => slideRevealSchema.parse({ durationFrames: 7 })).toThrow();
  });

  it("rejects durationFrames above maximum (60)", () => {
    expect(() => slideRevealSchema.parse({ durationFrames: 61 })).toThrow();
  });

  it("rejects distance above maximum (1)", () => {
    expect(() => slideRevealSchema.parse({ distance: 1.1 })).toThrow();
  });

  it("rejects invalid direction value", () => {
    expect(() => slideRevealSchema.parse({ direction: "diagonal" })).toThrow();
  });

  it("accepts all valid directions", () => {
    for (const dir of ["left", "right", "up", "down"] as const) {
      const result = slideRevealSchema.parse({ direction: dir });
      expect(result.direction).toBe(dir);
    }
  });

  it("accepts snappy easing", () => {
    const result = slideRevealSchema.parse({ easing: "snappy" });
    expect(result.easing).toBe("snappy");
  });
});

describe("SlideReveal — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with direction=left and easing=literary", () => {
    const { container } = render(
      <SlideReveal
        direction="left"
        durationFrames={24}
        distance={1}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing with direction=up and easing=snappy", () => {
    const { container } = render(
      <SlideReveal
        direction="up"
        durationFrames={30}
        distance={0.8}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders custom children instead of default content", () => {
    const { getByTestId } = render(
      <SlideReveal
        direction="right"
        durationFrames={24}
        distance={1}
        easing="literary"
      >
        <div data-testid="slide-child">Slide Content</div>
      </SlideReveal>,
    );
    expect(getByTestId("slide-child")).not.toBeNull();
  });

  it("applies transform style to the wrapper at frame=0 (off-screen position)", () => {
    const { getAllByTestId } = render(
      <SlideReveal
        direction="left"
        durationFrames={24}
        distance={1}
        easing="literary"
      />,
    );
    const fills = getAllByTestId("absolute-fill");
    const wrapper = fills[0];
    // At frame=0, progress=0, so translateX should be negative (off-screen left)
    expect(wrapper.style.transform).toBeDefined();
    expect(wrapper.style.transform).toContain("translateX");
  });

  it("does not use TransitionSeries (Eta refinement d compliance)", () => {
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.dependencies).not.toContain("@remotion/transitions");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("slide-reveal");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files).toHaveLength(1);
    expect(presentation.files[0].target).toBe(
      "remotion/transitions/slide-reveal.tsx",
    );
  });
});
