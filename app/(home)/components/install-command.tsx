"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Compact single-line, copyable install command pill. */
export function InstallCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const trackEvent = useTrackEvent();

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    trackEvent("install_command_copied", {
      component: "hero",
      package_manager: "npm",
      surface: "landing",
    });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="outline"
      onClick={copy}
      aria-label="Copy install command"
      className={cn(
        "group h-11 gap-3 rounded-full border-border bg-card/60 px-4 font-mono font-normal text-sm text-muted-foreground backdrop-blur-sm hover:border-foreground/20 hover:text-foreground",
        className,
      )}
    >
      <span aria-hidden className="select-none text-muted-foreground/50">
        $
      </span>
      <span className="truncate text-foreground">{command}</span>
      <span aria-hidden className="text-muted-foreground/70">
        {copied ? (
          <Check className="size-4 text-foreground" />
        ) : (
          <Copy className="size-4" />
        )}
      </span>
    </Button>
  );
}
