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
import { presentation, Typewriter, typewriterSchema } from "./typewriter";

describe("Typewriter — schema validation", () => {
  it("parses default values correctly", () => {
    const result = typewriterSchema.parse({ text: "Hello world" });
    expect(result.charsPerSec).toBe(24);
    expect(result.cursor).toBe(true);
    expect(result.accentColor).toBe("#f59e0b");
    expect(result.font).toBe("cormorant");
  });

  it("rejects charsPerSec below minimum (8)", () => {
    expect(() =>
      typewriterSchema.parse({ text: "test", charsPerSec: 7 }),
    ).toThrow();
  });

  it("rejects charsPerSec above maximum (80)", () => {
    expect(() =>
      typewriterSchema.parse({ text: "test", charsPerSec: 81 }),
    ).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() =>
      typewriterSchema.parse({ text: "test", font: "comic-sans" }),
    ).toThrow();
  });
});

describe("Typewriter — component rendering", () => {
  beforeEach(() => {
    vi.mocked(
      // biome-ignore lint/suspicious/noExplicitAny: test mock setup
      (vi.importMock("remotion") as any).useCurrentFrame,
    )?.mockReturnValue?.(0);
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<Typewriter text="The future is written." />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with cursor=false", () => {
    const { container } = render(
      <Typewriter
        text="No cursor here."
        cursor={false}
        charsPerSec={24}
        accentColor="#f59e0b"
        font="georgia"
      />,
    );
    expect(container.firstChild).not.toBeNull();
    // cursor span should not exist
    const cursorEl = container.querySelector('[aria-hidden="true"]');
    expect(cursorEl).toBeNull();
  });

  it("renders with font=georgia", () => {
    const { container } = render(
      <Typewriter
        text="Georgia typewriter."
        cursor={true}
        charsPerSec={30}
        accentColor="#f59e0b"
        font="georgia"
      />,
    );
    expect(container.firstChild).not.toBeNull();
    const span = container.querySelector("span");
    expect(span?.style.fontFamily).toContain("Georgia");
  });

  it("renders with font=system-ui", () => {
    const { container } = render(
      <Typewriter
        text="System UI style."
        cursor={true}
        charsPerSec={20}
        accentColor="#e8e0d0"
        font="system-ui"
      />,
    );
    expect(container.firstChild).not.toBeNull();
    const span = container.querySelector("span");
    expect(span?.style.fontFamily).toContain("system-ui");
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("typewriter");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/typewriter.tsx",
    );
  });
});
