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
import { presentation, ZoomPulse, zoomPulseSchema } from "./zoom-pulse";

describe("ZoomPulse — schema validation", () => {
  it("parses default values correctly", () => {
    const result = zoomPulseSchema.parse({});
    expect(result.scaleFrom).toBe(0.92);
    expect(result.scaleTo).toBe(1.06);
    expect(result.pulseFrames).toBe(30);
    expect(result.easing).toBe("literary");
  });

  it("rejects pulseFrames below minimum (8)", () => {
    expect(() => zoomPulseSchema.parse({ pulseFrames: 7 })).toThrow();
  });

  it("rejects pulseFrames above maximum (60)", () => {
    expect(() => zoomPulseSchema.parse({ pulseFrames: 61 })).toThrow();
  });

  it("rejects scaleFrom below minimum (0.5)", () => {
    expect(() => zoomPulseSchema.parse({ scaleFrom: 0.49 })).toThrow();
  });

  it("rejects scaleTo above maximum (2)", () => {
    expect(() => zoomPulseSchema.parse({ scaleTo: 2.1 })).toThrow();
  });

  it("accepts snappy easing", () => {
    const result = zoomPulseSchema.parse({ easing: "snappy" });
    expect(result.easing).toBe("snappy");
  });

  it("accepts custom scale range within bounds", () => {
    const result = zoomPulseSchema.parse({ scaleFrom: 0.8, scaleTo: 1.2 });
    expect(result.scaleFrom).toBe(0.8);
    expect(result.scaleTo).toBe(1.2);
  });
});

describe("ZoomPulse — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with defaults", () => {
    const { container } = render(
      <ZoomPulse
        scaleFrom={0.92}
        scaleTo={1.06}
        pulseFrames={30}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing with easing=snappy", () => {
    const { container } = render(
      <ZoomPulse
        scaleFrom={0.9}
        scaleTo={1.1}
        pulseFrames={20}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders custom children instead of default content", () => {
    const { getByTestId } = render(
      <ZoomPulse
        scaleFrom={0.92}
        scaleTo={1.06}
        pulseFrames={30}
        easing="literary"
      >
        <div data-testid="zoom-child">Zoom Content</div>
      </ZoomPulse>,
    );
    expect(getByTestId("zoom-child")).not.toBeNull();
  });

  it("applies transform: scale style at frame=0 (starting scale)", () => {
    const { getAllByTestId } = render(
      <ZoomPulse
        scaleFrom={0.92}
        scaleTo={1.06}
        pulseFrames={30}
        easing="literary"
      />,
    );
    const fills = getAllByTestId("absolute-fill");
    const wrapper = fills[0];
    expect(wrapper.style.transform).toBeDefined();
    expect(wrapper.style.transform).toContain("scale(");
  });

  it("does not use TransitionSeries (Eta refinement d compliance)", () => {
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.dependencies).not.toContain("@remotion/transitions");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("zoom-pulse");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files).toHaveLength(1);
    expect(presentation.files[0].target).toBe(
      "remotion/transitions/zoom-pulse.tsx",
    );
  });
});
