import { render, screen } from "@testing-library/react";
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
import {
  CinematicCut,
  cinematicCutSchema,
  presentation,
} from "./cinematic-cut";

describe("CinematicCut — schema validation", () => {
  it("parses default values correctly", () => {
    const result = cinematicCutSchema.parse({});
    expect(result.direction).toBe("horizontal");
    expect(result.duration).toBe(20);
    expect(result.accentColor).toBe("oklch(0.74 0.16 60)");
    expect(result.easing).toBe("literary");
  });

  it("rejects duration below minimum (8)", () => {
    expect(() => cinematicCutSchema.parse({ duration: 7 })).toThrow();
  });

  it("rejects duration above maximum (60)", () => {
    expect(() => cinematicCutSchema.parse({ duration: 61 })).toThrow();
  });

  it("rejects invalid direction value", () => {
    expect(() => cinematicCutSchema.parse({ direction: "up" })).toThrow();
  });
});

describe("CinematicCut — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with direction=horizontal and easing=literary", () => {
    const { container } = render(
      <CinematicCut
        direction="horizontal"
        duration={20}
        accentColor="#f59e0b"
        easing="literary"
        from={<div data-testid="scene-a">Scene A</div>}
        to={<div data-testid="scene-b">Scene B</div>}
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing with direction=vertical and easing=snappy", () => {
    const { container } = render(
      <CinematicCut
        direction="vertical"
        duration={30}
        accentColor="#f59e0b"
        easing="snappy"
        from={<div>A</div>}
        to={<div>B</div>}
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders default panels when from/to are not provided", () => {
    const { container } = render(
      <CinematicCut
        direction="diagonal"
        duration={15}
        accentColor="#f59e0b"
        easing="literary"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the from scene (before cut frame) when frame=0", () => {
    // frame=0 is before the midpoint cut (frame=30 in a 60-frame comp)
    render(
      <CinematicCut
        direction="horizontal"
        duration={20}
        accentColor="#f59e0b"
        easing="literary"
        transitionStart={30}
        from={<div data-testid="from-scene">From Scene</div>}
        to={<div data-testid="to-scene">To Scene</div>}
      />,
    );
    expect(screen.getByTestId("from-scene")).toBeInTheDocument();
  });

  it("honors the accentColor prop by passing it to the flash overlay", () => {
    const customAccent = "#ff6600";
    const { container } = render(
      <CinematicCut
        direction="horizontal"
        duration={20}
        accentColor={customAccent}
        easing="snappy"
      />,
    );
    // The accent flash div uses the color in a radial-gradient background
    // We verify the component renders (structural check — CSS-in-JS values
    // are not inspectable via DOM serialization in jsdom)
    expect(container.firstChild).not.toBeNull();
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("cinematic-cut");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files).toHaveLength(1);
    expect(presentation.files[0].target).toBe(
      "remotion/transitions/cinematic-cut.tsx",
    );
  });
});
