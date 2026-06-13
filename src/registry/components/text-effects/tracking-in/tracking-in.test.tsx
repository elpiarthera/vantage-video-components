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
    spring: vi.fn().mockReturnValue(0),
    Easing: actual.Easing,
  };
});

import type React from "react";
import { presentation, TrackingIn, trackingInSchema } from "./tracking-in";

describe("TrackingIn — schema validation", () => {
  it("parses default values correctly", () => {
    const result = trackingInSchema.parse({ text: "Reveal" });
    expect(result.startLetterSpacing).toBe(0.15);
    expect(result.startBlur).toBe(8);
    expect(result.durationFrames).toBe(22);
    expect(result.easing).toBe("literary");
    expect(result.font).toBe("cormorant");
  });

  it("rejects startLetterSpacing below minimum (0.05)", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", startLetterSpacing: 0.01 }),
    ).toThrow();
  });

  it("rejects startLetterSpacing above maximum (0.4)", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", startLetterSpacing: 0.5 }),
    ).toThrow();
  });

  it("rejects durationFrames below minimum (8)", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", durationFrames: 4 }),
    ).toThrow();
  });

  it("rejects durationFrames above maximum (60)", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", durationFrames: 61 }),
    ).toThrow();
  });

  it("rejects invalid easing value", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", easing: "bounce" }),
    ).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() =>
      trackingInSchema.parse({ text: "test", font: "helvetica" }),
    ).toThrow();
  });
});

describe("TrackingIn — component rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<TrackingIn text="Vantage Studio" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the text content", () => {
    const { container } = render(<TrackingIn text="Vantage Studio" />);
    expect(container.textContent).toContain("Vantage Studio");
  });

  it("renders with font=georgia at correct size", () => {
    const { container } = render(
      <TrackingIn text="Body text" font="georgia" />,
    );
    const span = container.querySelector("span");
    expect(span?.style.fontFamily).toContain("Georgia");
    // Georgia renders at 48px (below 56px Cormorant threshold)
    expect(span?.style.fontSize).toBe("48px");
  });

  it("renders with font=system-ui", () => {
    const { container } = render(
      <TrackingIn text="Caption" font="system-ui" />,
    );
    const span = container.querySelector("span");
    expect(span?.style.fontFamily).toContain("system-ui");
  });

  it("renders with font=cormorant at 72px", () => {
    const { container } = render(
      <TrackingIn text="Hero Title" font="cormorant" />,
    );
    const span = container.querySelector("span");
    expect(span?.style.fontFamily).toContain("Cormorant");
    expect(span?.style.fontSize).toBe("72px");
  });

  it("renders with easing=snappy without crashing", () => {
    const { container } = render(
      <TrackingIn text="Snappy reveal" easing="snappy" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("tracking-in");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/tracking-in.tsx",
    );
  });
});
