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
    spring: vi.fn().mockReturnValue(0),
    interpolate: actual.interpolate,
    Easing: actual.Easing,
  };
});

import type React from "react";
import {
  presentation,
  SlotMachineRoll,
  slotMachineRollSchema,
} from "./slot-machine-roll";

describe("SlotMachineRoll — schema validation", () => {
  it("parses default values correctly", () => {
    const result = slotMachineRollSchema.parse({});
    expect(result.from).toBe("$99");
    expect(result.to).toBe("$199");
    expect(result.rollFrames).toBe(30);
    expect(result.accentColor).toBe("#f59e0b");
    expect(result.font).toBe("georgia");
  });

  it("rejects rollFrames below minimum (8)", () => {
    expect(() => slotMachineRollSchema.parse({ rollFrames: 4 })).toThrow();
  });

  it("rejects rollFrames above maximum (80)", () => {
    expect(() => slotMachineRollSchema.parse({ rollFrames: 81 })).toThrow();
  });

  it("rejects invalid font value", () => {
    expect(() => slotMachineRollSchema.parse({ font: "impact" })).toThrow();
  });
});

describe("SlotMachineRoll — component rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with default props", () => {
    const { container } = render(<SlotMachineRoll />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders correct number of column spans for equal-length strings", () => {
    const { container } = render(<SlotMachineRoll from="ABC" to="XYZ" />);
    // 3 characters → 3 column spans (outer)
    const outerSpans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > span > span",
    );
    expect(outerSpans.length).toBe(3);
  });

  it("renders with font=cormorant at correct size", () => {
    const { container } = render(
      <SlotMachineRoll from="A" to="B" font="cormorant" />,
    );
    const rootSpan = container.querySelector(
      "[data-testid='absolute-fill'] > span",
    );
    expect(rootSpan?.style.fontFamily).toContain("Cormorant");
    expect(rootSpan?.style.fontSize).toBe("72px");
  });

  it("renders with font=system-ui", () => {
    const { container } = render(
      <SlotMachineRoll from="1" to="2" font="system-ui" />,
    );
    const rootSpan = container.querySelector(
      "[data-testid='absolute-fill'] > span",
    );
    expect(rootSpan?.style.fontFamily).toContain("system-ui");
  });

  it("pads shorter string to match longer length", () => {
    const { container } = render(<SlotMachineRoll from="A" to="ABC" />);
    // 3 columns expected (padded to max length 3)
    const outerSpans = container.querySelectorAll(
      "[data-testid='absolute-fill'] > span > span",
    );
    expect(outerSpans.length).toBe(3);
  });

  it("presentation config has correct name and type", () => {
    expect(presentation.name).toBe("slot-machine-roll");
    expect(presentation.type).toBe("registry:component");
    expect(presentation.dependencies).toContain("remotion");
    expect(presentation.files[0].target).toBe(
      "remotion/text-effects/slot-machine-roll.tsx",
    );
  });
});
