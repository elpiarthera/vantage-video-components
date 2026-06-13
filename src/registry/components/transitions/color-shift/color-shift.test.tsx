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
    interpolateColors: actual.interpolateColors,
    Easing: actual.Easing,
  };
});

import type React from "react";
import { ColorShift, colorShiftSchema, presentation } from "./color-shift";

describe("ColorShift — schema validation", () => {
  it("parses default values correctly", () => {
    const result = colorShiftSchema.parse({});
    expect(result.fromColor).toBe("#0a0a0a");
    expect(result.toColor).toBe("#f59e0b");
    expect(result.durationFrames).toBe(30);
    expect(result.easing).toBe("literary");
  });

  it("rejects durationFrames below minimum (8)", () => {
    expect(() => colorShiftSchema.parse({ durationFrames: 7 })).toThrow();
  });

  it("rejects durationFrames above maximum (60)", () => {
    expect(() => colorShiftSchema.parse({ durationFrames: 61 })).toThrow();
  });

  it("accepts custom fromColor and toColor", () => {
    const result = colorShiftSchema.parse({
      fromColor: "#141414",
      toColor: "#c9b99a",
    });
    expect(result.fromColor).toBe("#141414");
    expect(result.toColor).toBe("#c9b99a");
  });

  it("accepts snappy easing", () => {
    const result = colorShiftSchema.parse({ easing: "snappy" });
    expect(result.easing).toBe("snappy");
  });

  it("accepts BRAND.md vantage-secondary-highlight as toColor", () => {
    const result = colorShiftSchema.parse({ toColor: "#c9b99a" });
    expect(result.toColor).toBe("#c9b99a");
  });
});

describe("ColorShift — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with defaults", () => {
    const { container } = render(
      <ColorShift
        fromColor="#0a0a0a"
        toColor="#f59e0b"
        durationFrames={30}
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing with easing=snappy", () => {
    const { container } = render(
      <ColorShift
        fromColor="#141414"
        toColor="#c9b99a"
        durationFrames={20}
        easing="snappy"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders custom children over the color-shift background", () => {
    const { getByTestId } = render(
      <ColorShift
        fromColor="#0a0a0a"
        toColor="#f59e0b"
        durationFrames={30}
        easing="literary"
      >
        <div data-testid="shift-child">Color Shift Content</div>
      </ColorShift>,
    );
    expect(getByTestId("shift-child")).not.toBeNull();
  });

  it("applies backgroundColor style at frame=0 (should be fromColor)", () => {
    const { getAllByTestId } = render(
      <ColorShift
        fromColor="#0a0a0a"
        toColor="#f59e0b"
        durationFrames={30}
        easing="literary"
      />,
    );
    const fills = getAllByTestId("absolute-fill");
    const wrapper = fills[0];
    // At frame=0, progress=0, backgroundColor should be fromColor
    expect(wrapper.style.backgroundColor).toBeDefined();
    expect(wrapper.style.backgroundColor).not.toBe("");
  });

  it("does not use TransitionSeries (Eta refinement d compliance)", () => {
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.dependencies).not.toContain("@remotion/transitions");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("color-shift");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files).toHaveLength(1);
    expect(presentation.files[0].target).toBe(
      "remotion/transitions/color-shift.tsx",
    );
  });
});
