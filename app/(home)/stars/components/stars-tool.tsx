"use client";

import { Player, type PlayerRef } from "@remotion/player";
import {
  ArrowRight,
  BookOpen,
  Download,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ComponentCustomizer } from "@/components/docs/component-customizer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SPRING_BOUNCE } from "@/config/site";
import type { ControlConfig } from "@/lib/customizer-config";
import { formatStars } from "@/lib/github";
import { parseRepoInput } from "@/lib/parse-repo";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import registry, { type RegistryEntry } from "@/registry/__index__";
import { FadeUp } from "../../components/fade-up";
import { InstallCommand } from "../../components/install-command";

type Orientation = "horizontal" | "vertical";

/** Exactly the success shape returned by GET /api/stargazers. */
type StargazersPayload = {
  owner: string;
  repo: string;
  totalStars: number;
  truncated: boolean;
  stargazers: { login: string; avatarUrl: string; starredAt: string }[];
};

const INSTALL = "npx shadcn@latest add remocn/github-stars";

/** 1280×720 ↔ 720×1280 — the two presets the composition + export render at. */
function dims(orientation: Orientation) {
  return orientation === "vertical"
    ? { width: 720, height: 1280 }
    : { width: 1280, height: 720 };
}

/** Scalar controls surfaced in the optional Customize panel (no array control). */
const CUSTOM_CONTROLS: ControlConfig = {
  accentColor: { type: "color", default: "#ffbb00", label: "Accent" },
  theme: {
    type: "select",
    default: "light",
    options: ["light", "dark"],
    label: "Theme",
  },
  speed: {
    type: "number",
    default: 1,
    min: 1,
    max: 4,
    step: 0.25,
    label: "Speed",
  },
};

export function StarsTool() {
  const entry = registry["github-stars"];
  const reduced = usePrefersReducedMotion();

  // URL state (project rule: nuqs, not raw useSearchParams). `?repo=` reopens a
  // shared link; `?o=h|v` persists the orientation.
  const [repoParam, setRepoParam] = useQueryState("repo", {
    defaultValue: "",
  });
  const [oParam, setOParam] = useQueryState("o", { defaultValue: "h" });
  const orientation: Orientation = oParam === "v" ? "vertical" : "horizontal";

  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [inputValue, setInputValue] = useState(repoParam ?? "");
  const [zeroStars, setZeroStars] = useState(false);
  const [data, setData] = useState<StargazersPayload | null>(null);

  // Customizer values (scalar inputProps only).
  const [accentColor, setAccentColor] = useState("#ffbb00");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [speed, setSpeed] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const genAbortRef = useRef<AbortController | null>(null);

  const parsed = parseRepoInput(inputValue);
  const canGenerate = parsed !== null;

  // ---- generation --------------------------------------------------------

  const handleApiError = useCallback((statusCode: number, code?: string) => {
    if (code === "not_found" || statusCode === 404) {
      toast.error("Repository not found — check owner/name");
    } else if (code === "rate_limited" || statusCode === 429) {
      toast.error("GitHub rate limit hit — try again shortly");
    } else if (code === "invalid_repo" || statusCode === 400) {
      toast.error("Invalid repository. Use owner/name");
    } else {
      toast.error("Couldn't reach GitHub — retry");
    }
  }, []);

  const runGeneration = useCallback(
    async (rawRepo: string) => {
      const valid = parseRepoInput(rawRepo);
      if (!valid) {
        toast.error("Enter a repo as owner/name");
        return;
      }
      setZeroStars(false);
      setStatus("generating");

      const controller = new AbortController();
      genAbortRef.current = controller;

      try {
        const res = await fetch(
          `/api/stargazers?repo=${encodeURIComponent(rawRepo)}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            code?: string;
          } | null;
          handleApiError(res.status, body?.code);
          setStatus("idle");
          return;
        }

        const json = (await res.json()) as StargazersPayload;

        // Zero-star repos come back 200 with an empty list — a friendly inline
        // state, not a hard error.
        if (json.totalStars === 0 || json.stargazers.length === 0) {
          setZeroStars(true);
          setStatus("idle");
          return;
        }

        setData(json);
        setStatus("ready");
      } catch (err) {
        // Cancel (AbortController) returns to idle silently.
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        toast.error("Couldn't reach GitHub — retry");
        setStatus("idle");
      } finally {
        genAbortRef.current = null;
      }
    },
    [handleApiError],
  );

  // Auto-advance past idle when the page loads with a valid `?repo=` (shared link).
  const didAutoStart = useRef(false);
  useEffect(() => {
    if (didAutoStart.current) return;
    didAutoStart.current = true;
    if (repoParam && parseRepoInput(repoParam)) {
      setInputValue(repoParam);
      void runGeneration(repoParam);
    }
  }, [repoParam, runGeneration]);

  const handleSubmit = useCallback(() => {
    const value = inputValue.trim();
    if (!parseRepoInput(value)) {
      toast.error("Enter a repo as owner/name");
      return;
    }
    void setRepoParam(value);
    void runGeneration(value);
  }, [inputValue, runGeneration, setRepoParam]);

  const cancelGeneration = useCallback(() => {
    genAbortRef.current?.abort();
    setStatus("idle");
  }, []);

  // ---- render-on-web export ---------------------------------------------

  const [supportsExport, setSupportsExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Feature-detect WebCodecs after mount (avoids hydration mismatch).
    setSupportsExport(
      typeof window !== "undefined" &&
        typeof window.VideoEncoder !== "undefined",
    );
  }, []);

  const inputProps = useMemo(
    () =>
      data
        ? {
            repo: `${data.owner}/${data.repo}`,
            totalStars: data.totalStars,
            stargazers: data.stargazers,
            orientation,
            accentColor,
            speed,
            theme,
          }
        : null,
    [data, orientation, accentColor, speed, theme],
  );

  const handleDownload = useCallback(async () => {
    if (!supportsExport) {
      toast.info("MP4 export needs Chrome or Edge");
      return;
    }
    if (!entry || !data || !inputProps) return;

    const controller = new AbortController();
    exportAbortRef.current = controller;
    setExporting(true);
    setExportProgress(0);

    try {
      const { renderMediaOnWeb } = await import("@remotion/web-renderer");
      const base = dims(orientation);
      // Render the export cheaper than the 30fps preview: lower resolution + fps.
      // The composition's motion is purely frame/durationInFrames ratios (no
      // spring, never reads fps), so a 24fps/240-frame render is real-time
      // identical to 30fps/300 — only the encode + per-frame cost drops (≈2-3×
      // faster). Raise EXPORT_SCALE/EXPORT_FPS to trade speed for fidelity.
      const EXPORT_SCALE = 0.7;
      const EXPORT_FPS = 24;
      const even = (n: number) =>
        Math.max(2, Math.round((n * EXPORT_SCALE) / 2) * 2);
      const durationInFrames = Math.max(
        1,
        Math.round(
          (entry.config.durationInFrames / entry.config.fps) * EXPORT_FPS,
        ),
      );
      const { getBlob } = await renderMediaOnWeb({
        composition: {
          id: "github-stars",
          component: entry.Component,
          durationInFrames,
          fps: EXPORT_FPS,
          width: even(base.width),
          height: even(base.height),
        },
        inputProps,
        container: "mp4",
        signal: controller.signal,
        onProgress: ({ progress }) => setExportProgress(progress),
      });

      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.owner}-${data.repo}-stars.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        // Surface the real cause (e.g. a Remotion version mismatch) instead of
        // swallowing it — the toast stays friendly, the console is diagnosable.
        console.error("[stars] MP4 export failed:", err);
        const detail = err instanceof Error ? err.message : String(err);
        toast.error("Export failed", { description: detail });
      }
    } finally {
      setExporting(false);
      exportAbortRef.current = null;
    }
  }, [supportsExport, entry, data, inputProps, orientation]);

  const cancelExport = useCallback(() => {
    exportAbortRef.current?.abort();
  }, []);

  // Clear the current repo and return to the idle input so the user can paste a
  // different one. The `didAutoStart` ref stays set, so wiping `?repo=` here does
  // NOT re-trigger the auto-advance (that only runs on a fresh page load).
  const handleReset = useCallback(() => {
    genAbortRef.current?.abort();
    exportAbortRef.current?.abort();
    setData(null);
    setZeroStars(false);
    setInputValue("");
    void setRepoParam(null);
    setStatus("idle");
  }, [setRepoParam]);

  const onCustomChange = useCallback((key: string, value: unknown) => {
    if (key === "accentColor") setAccentColor(value as string);
    else if (key === "theme") setTheme(value as "light" | "dark");
    else if (key === "speed") setSpeed(value as number);
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Backdrop: dotted grid that fades out. No glow ornaments. */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-fade" />
        </div>

        <div className="section">
          {status === "idle" && (
            <IdleView
              inputValue={inputValue}
              setInputValue={(v) => {
                setInputValue(v);
                if (zeroStars) setZeroStars(false);
              }}
              onSubmit={handleSubmit}
              canGenerate={canGenerate}
              zeroStars={zeroStars}
            />
          )}

          {status === "generating" && (
            <GeneratingView reduced={reduced} onCancel={cancelGeneration} />
          )}

          {status === "ready" && entry && data && inputProps && (
            // Constant width regardless of orientation — the preview frame stays
            // put when toggling horizontal/vertical (refinement #3).
            <div className="mx-auto max-w-5xl">
              {data.truncated && (
                <Alert className="mb-4">
                  <AlertTitle>Showing a sample</AlertTitle>
                  <AlertDescription>
                    This repo has {formatStars(data.totalStars)} stars — the
                    clip animates an evenly sampled subset for a smooth render.
                  </AlertDescription>
                </Alert>
              )}

              <ReadyView
                entry={entry}
                inputProps={inputProps}
                repo={`${data.owner}/${data.repo}`}
                totalStars={data.totalStars}
                onReset={handleReset}
                orientation={orientation}
                onOrientationChange={(o) =>
                  void setOParam(o === "vertical" ? "v" : "h")
                }
                reduced={reduced}
                showCustomizer={showCustomizer}
                onToggleCustomizer={() => setShowCustomizer((s) => !s)}
                customValues={{ accentColor, theme, speed }}
                onCustomChange={onCustomChange}
                supportsExport={supportsExport}
                exporting={exporting}
                exportProgress={exportProgress}
                onDownload={() => void handleDownload()}
                onCancelExport={cancelExport}
              />
            </div>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}

// ---- idle ----------------------------------------------------------------

function IdleView({
  inputValue,
  setInputValue,
  onSubmit,
  canGenerate,
  zeroStars,
}: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: () => void;
  canGenerate: boolean;
  zeroStars: boolean;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <FadeUp delay={0.06} className="flex flex-col items-center">
        <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Turn your repo&rsquo;s stars into a video
        </h1>
      </FadeUp>

      <FadeUp delay={0.12}>
        <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Paste a GitHub repo. We fetch every stargazer and animate it into a
          shareable clip.
        </p>
      </FadeUp>

      <FadeUp delay={0.18} className="w-full">
        <form
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="GitHub repository"
            placeholder="github.com/owner/repo or owner/repo"
            className="h-11 w-full rounded-full px-5 sm:max-w-sm"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!canGenerate}
            className="h-11 gap-2 rounded-full px-6"
          >
            Generate
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </FadeUp>
    </div>
  );
}

// ---- generating ----------------------------------------------------------

function GeneratingView({
  reduced,
  onCancel,
}: {
  reduced: boolean;
  onCancel: () => void;
}) {
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      setProgress(90);
      return;
    }
    const id = setInterval(() => {
      setTick((t) => t + Math.floor(Math.random() * 40) + 10);
      setProgress((v) => Math.min(v + (90 - v) * 0.12, 90));
    }, 160);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="surface-card mx-auto w-full max-w-xl rounded-3xl p-8">
        {/* Ghost avatar chips streaming in — the "stargazers flying in" tease. */}
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative placeholders
              key={i}
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduced ? undefined : { ...SPRING_BOUNCE, delay: i * 0.06 }
              }
            >
              <Skeleton className="size-9 rounded-full" />
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <Progress value={progress} />
        </div>

        <p className="mt-4 text-center text-sm font-medium text-foreground">
          Fetching stargazers…{" "}
          <span className="tabular-nums text-muted-foreground">
            {tick.toLocaleString("en-US")}
          </span>
        </p>

        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={onCancel} className="rounded-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- ready ---------------------------------------------------------------

function ReadyView({
  entry,
  inputProps,
  repo,
  totalStars,
  onReset,
  orientation,
  onOrientationChange,
  reduced,
  showCustomizer,
  onToggleCustomizer,
  customValues,
  onCustomChange,
  supportsExport,
  exporting,
  exportProgress,
  onDownload,
  onCancelExport,
}: {
  entry: RegistryEntry;
  inputProps: Record<string, unknown>;
  repo: string;
  totalStars: number;
  onReset: () => void;
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  reduced: boolean;
  showCustomizer: boolean;
  onToggleCustomizer: () => void;
  customValues: Record<string, unknown>;
  onCustomChange: (key: string, value: unknown) => void;
  supportsExport: boolean;
  exporting: boolean;
  exportProgress: number;
  onDownload: () => void;
  onCancelExport: () => void;
}) {
  const playerRef = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(!reduced);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isPlaying()) {
      p.pause();
      setPlaying(false);
    } else {
      p.play();
      setPlaying(true);
    }
  }, []);

  const { width, height } = dims(orientation);

  return (
    <motion.div
      initial={reduced ? false : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...SPRING_BOUNCE, delay: 0.05 }}
    >
      {/* Repo title — centered heading. */}
      <div className="mb-4 text-center">
        <h2 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {repo}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatStars(totalStars)} stars
        </p>
      </div>

      {/* Controls bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          value={[orientation === "vertical" ? "v" : "h"]}
          onValueChange={(value: string[]) => {
            const next = value[0];
            if (next)
              onOrientationChange(next === "v" ? "vertical" : "horizontal");
          }}
          aria-label="Video orientation"
          className="w-full sm:w-auto"
        >
          <ToggleGroupItem value="h" className="flex-1 sm:flex-none">
            Horizontal
          </ToggleGroupItem>
          <ToggleGroupItem value="v" className="flex-1 sm:flex-none">
            Vertical
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCustomizer}
          aria-expanded={showCustomizer}
          className="gap-2 rounded-full"
        >
          <Settings2 className="size-4" aria-hidden="true" />
          Customize
        </Button>
      </div>

      {/* Player card — a fixed 16:9 frame so toggling orientation never reflows
          the page. Vertical renders pillarboxed + centered inside it, while the
          Player still gets the true 720×1280 composition so the exported MP4 is
          genuinely vertical (only the on-page container width stays constant). */}
      <div
        className="group surface-card relative w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/5 sm:rounded-3xl dark:shadow-black/40"
        style={{ aspectRatio: "1280 / 720" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-full"
            style={
              orientation === "vertical"
                ? {
                    height: "100%",
                    width: "auto",
                    aspectRatio: `${width} / ${height}`,
                  }
                : { width: "100%", height: "100%" }
            }
          >
            <Player
              ref={playerRef}
              component={entry.Component}
              inputProps={inputProps}
              durationInFrames={entry.config.durationInFrames}
              fps={entry.config.fps}
              compositionWidth={width}
              compositionHeight={height}
              style={{ width: "100%", height: "100%", display: "block" }}
              autoPlay={!reduced}
              loop
              acknowledgeRemotionLicense
            />
          </div>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="absolute inset-0 flex items-center justify-center bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span
            aria-hidden
            data-show={!playing}
            className="pointer-events-none flex size-14 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none data-[show=true]:opacity-100"
          >
            {playing ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5 translate-x-0.5" />
            )}
          </span>
        </button>
      </div>

      {/* Optional customizer panel (scalar inputProps). */}
      {showCustomizer && (
        <div className="mt-4">
          <ComponentCustomizer
            controls={CUSTOM_CONTROLS}
            values={customValues}
            onChange={onCustomChange}
          />
        </div>
      )}

      {/* Footer row: install advert + export. */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <InstallCommand command={INSTALL} />
          <Button
            variant="outline"
            size="lg"
            className="h-11 gap-2 rounded-full"
            render={<Link href="/docs/social/github-stars" />}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            View component docs
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="lg"
            onClick={onReset}
            className="gap-2 rounded-full"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Change repository
          </Button>
          {exporting ? (
          <div className="flex w-full items-center gap-3 sm:w-72">
            <Progress
              value={Math.round(exportProgress * 100)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelExport}
              aria-label="Cancel export"
              className="rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : supportsExport ? (
          <Button size="lg" onClick={onDownload} className="gap-2 rounded-full">
            <Download className="size-4" aria-hidden="true" />
            Download MP4
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                // Not the native `disabled` attribute — a disabled button
                // suppresses hover/click, hiding the tooltip and the info toast.
                // Style it muted and let onDownload surface the Chrome/Edge hint.
                <Button
                  size="lg"
                  aria-disabled
                  onClick={onDownload}
                  className="gap-2 rounded-full opacity-50"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download MP4
                </Button>
              }
            />
            <TooltipContent>MP4 export needs Chrome or Edge</TooltipContent>
          </Tooltip>
          )}
        </div>
      </div>
    </motion.div>
  );
}
