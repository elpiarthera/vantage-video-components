import type { Step } from "@/lib/remocn-ui";
import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";
import {
  BUTTON_SCENARIOS,
  type ButtonAction,
  type ButtonScenario,
} from "@/registry/remocn-ui/button";

function serializeSteps(steps: Step<ButtonAction>[]): string {
  if (steps.length === 0) return "[]";
  const body = steps
    .map((step) => {
      const parts = [`at: ${step.at}`, `action: "${step.action}"`];
      if (step.duration !== undefined) parts.push(`duration: ${step.duration}`);
      return `    { ${parts.join(", ")} },`;
    })
    .join("\n");
  return `[\n${body}\n  ]`;
}

export const buttonConfig: ComponentConfig = {
  componentName: "Button",
  importPath: "@/components/remocn/button",
  controls: {
    label: { type: "text", default: "Continue", label: "Label" },
    variant: {
      type: "select",
      default: "default",
      options: ["default", "secondary", "destructive", "outline", "ghost"],
      label: "Variant",
    },
    size: {
      type: "select",
      default: "default",
      options: ["sm", "default", "lg"],
      label: "Size",
    },
    scenario: {
      type: "select",
      default: "happy",
      options: ["happy", "loading", "error", "idle"],
      label: "Scenario",
    },
    mode: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Mode",
    },
    primary: { type: "color", default: "#171717", label: "Primary" },
  },
  durationInFrames: 120,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  snippet: (values) => {
    const scenario = (values.scenario as ButtonScenario) ?? "happy";
    const label = values.label as string | undefined;
    const variant = values.variant as string | undefined;
    const size = values.size as string | undefined;
    const mode = values.mode as string | undefined;
    const primary = values.primary as string | undefined;

    const props: string[] = [];
    if (label !== undefined && label !== "Continue")
      props.push(`  label="${label}"`);
    if (variant !== undefined && variant !== "default")
      props.push(`  variant="${variant}"`);
    if (size !== undefined && size !== "default")
      props.push(`  size="${size}"`);
    if (mode !== undefined && mode !== "light")
      props.push(`  mode="${mode}"`);
    if (primary !== undefined && primary !== "#171717")
      props.push(`  primary="${primary}"`);
    props.push(`  steps={${serializeSteps(BUTTON_SCENARIOS[scenario])}}`);

    return `import { Button } from "@/components/remocn/button";

<Button
${props.join("\n")}
/>`;
  },
};
