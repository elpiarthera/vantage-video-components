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
  MatrixDecode,
  matrixDecodeSchema,
  presentation,
} from "./matrix-decode";

describe("MatrixDecode — schema validation", () => {
  it("parses default values correctly", () => {
    const result = matrixDecodeSchema.parse({ text: "DECODE" });
    expect(result.revealFrames).toBe(36);
    expect(result.glyphAlphabet).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    expect(result.font).toBe("system-ui");
    expect(result.seed).toBe(42);
  });

  it("rejects revealFrames below minimum (8)", () => {
    expect(() =>
      matrixDecodeSchema.parse({ text: "test", revealFrames: 4 }),
    ).toThrow();
  });

  it("rejects revealFrames above maximum (80)", () => {
    expect(() =>
      matrixDecodeSchema.parse({ text: "test", revealFrames: 81 }),
    ).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() =>
      matrixDecodeSchema.parse({ text: "test", font: "monospace" }),
    ).toThrow();
  });

  it("accepts a custom glyphAlphabet", () => {
    const result = matrixDecodeSchema.parse({
      text: "test",
      glyphAlphabet: "01",
    });
    expect(result.glyphAlphabet).toBe("01");
  });
});

describe("MatrixDecode — component rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<MatrixDecode text="DECODE" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with font=cormorant", () => {
    const { container } = render(<MatrixDecode text="HERO" font="cormorant" />);
    const span = container.querySelector(
      "[data-testid='absolute-fill'] > span",
    );
    expect(span?.style.fontFamily).toContain("Cormorant");
    expect(span?.style.fontSize).toBe("72px");
  });

  it("renders with font=georgia", () => {
    const { container } = render(<MatrixDecode text="BODY" font="georgia" />);
    const span = container.querySelector(
      "[data-testid='absolute-fill'] > span",
    );
    expect(span?.style.fontFamily).toContain("Georgia");
  });

  it("renders with font=system-ui", () => {
    const { container } = render(<MatrixDecode text="SYS" font="system-ui" />);
    const span = container.querySelector(
      "[data-testid='absolute-fill'] > span",
    );
    expect(span?.style.fontFamily).toContain("system-ui");
  });

  it("renders one span per non-space character", () => {
    const { container } = render(<MatrixDecode text="AB" seed={1} />);
    // Each letter gets its own span (2 chars → 2 char spans)
    const charSpans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > span > span",
    );
    expect(charSpans.length).toBe(2);
  });

  it("renders space characters as inline-block spans", () => {
    const { container } = render(<MatrixDecode text="A B" seed={7} />);
    // 3 chars (A, space, B) → 3 spans
    const charSpans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > span > span",
    );
    expect(charSpans.length).toBe(3);
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("matrix-decode");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/matrix-decode.tsx",
    );
  });
});
