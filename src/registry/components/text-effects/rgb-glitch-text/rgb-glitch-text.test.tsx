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
    random: vi.fn().mockReturnValue(0.5),
    interpolate: actual.interpolate,
    Easing: actual.Easing,
  };
});

import type React from "react";
import {
  presentation,
  RGBGlitchText,
  rgbGlitchTextSchema,
} from "./rgb-glitch-text";

describe("RGBGlitchText — schema validation", () => {
  it("parses default values correctly", () => {
    const result = rgbGlitchTextSchema.parse({ text: "GLITCH" });
    expect(result.glitchFrames).toBe(10);
    expect(result.offsetPx).toBe(4);
    expect(result.font).toBe("cormorant");
  });

  it("rejects glitchFrames below minimum (2)", () => {
    expect(() =>
      rgbGlitchTextSchema.parse({ text: "test", glitchFrames: 1 }),
    ).toThrow();
  });

  it("rejects glitchFrames above maximum (30)", () => {
    expect(() =>
      rgbGlitchTextSchema.parse({ text: "test", glitchFrames: 31 }),
    ).toThrow();
  });

  it("rejects offsetPx above maximum (12)", () => {
    expect(() =>
      rgbGlitchTextSchema.parse({ text: "test", offsetPx: 13 }),
    ).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() =>
      rgbGlitchTextSchema.parse({ text: "test", font: "comic-sans" }),
    ).toThrow();
  });

  it("accepts font=system-ui", () => {
    const result = rgbGlitchTextSchema.parse({
      text: "test",
      font: "system-ui",
    });
    expect(result.font).toBe("system-ui");
  });
});

describe("RGBGlitchText — component rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<RGBGlitchText text="CHAOS" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the text content", () => {
    const { container } = render(<RGBGlitchText text="CHAOS" />);
    // text appears in base span + 3 channel copies = 4 occurrences
    const textNodes = container.querySelectorAll("span");
    const allText = Array.from(textNodes)
      .map((n) => n.textContent)
      .join("");
    expect(allText).toContain("CHAOS");
  });

  it("renders 3 aria-hidden channel copies during glitch (frame=0 < glitchFrames)", () => {
    const { container } = render(
      <RGBGlitchText text="GLITCH" glitchFrames={10} />,
    );
    const hiddenSpans = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenSpans.length).toBe(3);
  });

  it("renders with font=georgia", () => {
    const { container } = render(<RGBGlitchText text="Body" font="georgia" />);
    const baseSpan = container.querySelector(
      "[data-testid='absolute-fill'] > div > span",
    );
    expect(baseSpan?.style.fontFamily).toContain("Georgia");
  });

  it("renders with font=cormorant at 80px (H1 register)", () => {
    const { container } = render(
      <RGBGlitchText text="Hero" font="cormorant" />,
    );
    const baseSpan = container.querySelector(
      "[data-testid='absolute-fill'] > div > span",
    );
    expect(baseSpan?.style.fontFamily).toContain("Cormorant");
    expect(baseSpan?.style.fontSize).toBe("80px");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("rgb-glitch-text");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/rgb-glitch-text.tsx",
    );
  });
});
