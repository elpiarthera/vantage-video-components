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
    Easing: actual.Easing,
  };
});

import type React from "react";
import {
  presentation,
  StrikethroughReplace,
  strikethroughReplaceSchema,
} from "./strikethrough-replace";

describe("StrikethroughReplace — schema validation", () => {
  it("parses default values correctly", () => {
    const result = strikethroughReplaceSchema.parse({
      oldText: "old",
      newText: "new",
    });
    expect(result.strikeFrames).toBe(14);
    expect(result.revealFrames).toBe(14);
    expect(result.font).toBe("georgia");
  });

  it("rejects strikeFrames below minimum (8)", () => {
    expect(() =>
      strikethroughReplaceSchema.parse({
        oldText: "a",
        newText: "b",
        strikeFrames: 4,
      }),
    ).toThrow();
  });

  it("rejects strikeFrames above maximum (30)", () => {
    expect(() =>
      strikethroughReplaceSchema.parse({
        oldText: "a",
        newText: "b",
        strikeFrames: 31,
      }),
    ).toThrow();
  });

  it("rejects revealFrames below minimum (8)", () => {
    expect(() =>
      strikethroughReplaceSchema.parse({
        oldText: "a",
        newText: "b",
        revealFrames: 3,
      }),
    ).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() =>
      strikethroughReplaceSchema.parse({
        oldText: "a",
        newText: "b",
        font: "verdana",
      }),
    ).toThrow();
  });

  it("accepts cormorant font", () => {
    const result = strikethroughReplaceSchema.parse({
      oldText: "old",
      newText: "new",
      font: "cormorant",
    });
    expect(result.font).toBe("cormorant");
  });
});

describe("StrikethroughReplace — component rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with required props", () => {
    const { container } = render(
      <StrikethroughReplace oldText="Before" newText="After" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders both old and new text strings", () => {
    const { container } = render(
      <StrikethroughReplace oldText="Wrong" newText="Right" />,
    );
    expect(container.textContent).toContain("Wrong");
    expect(container.textContent).toContain("Right");
  });

  it("renders an aria-hidden strikethrough line element", () => {
    const { container } = render(
      <StrikethroughReplace oldText="Old" newText="New" />,
    );
    const strikeEl = container.querySelector('[aria-hidden="true"]');
    expect(strikeEl).not.toBeNull();
  });

  it("renders with font=cormorant at 72px", () => {
    const { container } = render(
      <StrikethroughReplace
        oldText="Title A"
        newText="Title B"
        font="cormorant"
      />,
    );
    const spans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > div > span",
    );
    // Both spans should be using cormorant
    expect(spans[0]?.style.fontFamily).toContain("Cormorant");
    expect(spans[0]?.style.fontSize).toBe("72px");
  });

  it("renders with font=system-ui", () => {
    const { container } = render(
      <StrikethroughReplace
        oldText="Caption A"
        newText="Caption B"
        font="system-ui"
      />,
    );
    const spans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > div > span",
    );
    expect(spans[0]?.style.fontFamily).toContain("system-ui");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("strikethrough-replace");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/strikethrough-replace.tsx",
    );
  });
});
