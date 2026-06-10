"use client";

import { useRemocnTheme } from "@/lib/remocn-ui";
import {
  Toast,
  type ToastState,
  type ToastVariant,
} from "@/registry/remocn-ui/toast";

export interface ToastPreviewProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  state?: ToastState;
  mode?: "light" | "dark";
}

/**
 * Preview-only wrapper for the customizer. The shipped `Toast` is a
 * placement-agnostic card — it renders inside a transparent wrapper and the
 * caller positions it (e.g. bottom-right, see the example). The customizer
 * Player renders its `component` as the composition root, so a bare `Toast`
 * would sit in normal flow and stretch; this thin wrapper centers it on a
 * theme-background stage just for the preview. NOT shipped: not listed in
 * registry.json files; users position the toast themselves.
 */
export function ToastPreview({
  title = "Changes saved",
  description = "Your profile has been updated.",
  variant = "success",
  state = "visible",
  mode,
}: ToastPreviewProps) {
  const theme = useRemocnTheme(undefined, mode);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.background,
      }}
    >
      <Toast
        title={title}
        description={description}
        variant={variant}
        state={state}
        mode={mode}
      />
    </div>
  );
}
