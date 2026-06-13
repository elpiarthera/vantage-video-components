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
  ShimmerSweep,
  shimmerSweepSchema,
} from "./shimmer-sweep";

describe("ShimmerSweep — schema validation", () => {
  it("parses default values correctly", () => {
    const result = shimmerSweepSchema.parse({ text: "Vantage" });
    expect(result.baseColor).toBe("oklch(0.62 0.01 80)");
    expect(result.sweepColor).toBe("#f59e0b");
    expect(result.sweepFrames).toBe(45);
    expect(result.easing).toBe("snappy");
  });

  it("rejects sweepFrames below minimum (20)", () => {
    expect(() =>
      shimmerSweepSchema.parse({ text: "x", sweepFrames: 19 }),
    ).toThrow();
  });

  it("rejects sweepFrames above maximum (90)", () => {
    expect(() =>
      shimmerSweepSchema.parse({ text: "x", sweepFrames: 91 }),
    ).toThrow();
  });

  it("rejects invalid easing value", () => {
    expect(() =>
      shimmerSweepSchema.parse({ text: "x", easing: "elastic" }),
    ).toThrow();
  });
});

describe("ShimmerSweep — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<ShimmerSweep text="Vantage" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with easing=literary", () => {
    const { container } = render(
      <ShimmerSweep
        text="Slow shimmer"
        baseColor="#9ca3af"
        sweepColor="#f59e0b"
        sweepFrames={60}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders two text spans (base + sweep overlay)", () => {
    const { container } = render(
      <ShimmerSweep text="Two layers" sweepFrames={45} easing="snappy" />,
    );
    const spans = container.querySelectorAll("span");
    // At minimum: base text span + sweep overlay span
    expect(spans.length).toBeGreaterThanOrEqual(2);
  });

  it("renders with custom hex colors", () => {
    const { container } = render(
      <ShimmerSweep
        text="Custom"
        baseColor="#555555"
        sweepColor="#ff8800"
        sweepFrames={30}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("shimmer-sweep");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/shimmer-sweep.tsx",
    );
  });
});
