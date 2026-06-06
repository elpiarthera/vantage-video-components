"use client";

import { Menu, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavLink } from "@/config/landing";
import { useTrackEvent } from "@/lib/analytics";
import { formatStars } from "@/lib/github";
import { NavMobile } from "./header-nav";
import { ThemeToggle } from "./theme-toggle";

const GITHUB_URL = "https://github.com/kapishdima/remocn";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    role="img"
    aria-label="GitHub"
  >
    <title>GitHub</title>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.44-2.7 5.41-5.27 5.7.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

function GitHubStars({
  stars,
  onClick,
}: {
  stars: number | null;
  onClick?: () => void;
}) {
  return (
    <Link
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <GitHubIcon className="size-4" />
      <span className="hidden sm:inline">Star</span>
      {stars !== null && (
        <span className="inline-flex items-center gap-1 tabular-nums text-foreground">
          <Star className="size-3.5 fill-current" />
          {formatStars(stars)}
        </span>
      )}
    </Link>
  );
}

/** Wordmark + logo, links home. Shared across the landing and docs headers. */
export function HeaderLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none"
    >
      <Image
        src="/logo.svg"
        alt="remocn logo"
        width={24}
        height={24}
        priority
        className="rounded-md"
      />
      remocn
    </Link>
  );
}

/**
 * Right-hand header cluster shared by both headers: GitHub stars (desktop),
 * theme toggle, and the mobile menu Sheet. Owns its own open state and the
 * GitHub click tracking. The Sheet contains the mobile link list plus the
 * stars and Get-started CTA.
 */
export function HeaderActions({
  navLinks,
  githubStars,
}: {
  navLinks: NavLink[];
  githubStars: number | null;
}) {
  const [open, setOpen] = useState(false);
  const trackEvent = useTrackEvent();
  const trackGitHubClick = () =>
    trackEvent("cta_clicked", {
      cta: "github_header",
      destination: GITHUB_URL,
    });

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block">
        <GitHubStars stars={githubStars} onClick={trackGitHubClick} />
      </div>
      <ThemeToggle />

      {/* Mobile nav trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="rounded-full sm:hidden"
              aria-label="Open menu"
            />
          }
        >
          <Menu className="size-4" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="bg-background">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <NavMobile links={navLinks} onNavigate={() => setOpen(false)} />
          <div className="mt-4 flex flex-col gap-4 px-6 pb-6">
            <GitHubStars
              stars={githubStars}
              onClick={() => {
                setOpen(false);
                trackGitHubClick();
              }}
            />
            <Button
              size="lg"
              className="h-11 w-full rounded-full"
              render={
                <Link
                  href="/docs/getting-started/introduction"
                  onClick={() => setOpen(false)}
                />
              }
            >
              Get started
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
