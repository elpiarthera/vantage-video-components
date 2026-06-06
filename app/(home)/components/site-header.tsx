"use client";

import { useEffect, useState } from "react";
import { type NavLink } from "@/config/landing";
import { cn } from "@/lib/utils";
import { NavDesktop } from "./header-nav";
import { HeaderActions, HeaderLogo } from "./header-parts";

/**
 * Sticky header for the external pages (landing, sponsors). It always sticks to
 * the top and collapses the full-width bar into a floating, container-width
 * pill once the page scrolls. The static docs header lives in `DocsHeader`.
 */
export function SiteHeader({
  navLinks,
  githubStars = null,
}: {
  navLinks: NavLink[];
  githubStars?: number | null;
}) {
  const [scrolled, setScrolled] = useState(false);

  // Collapse the full-width bar into a floating, container-width pill on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isPill = scrolled;

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-40 transition-[background-color,border-color,padding] duration-300",
        isPill
          ? "border-transparent bg-transparent py-3"
          : "border-border bg-background/70 backdrop-blur-xl",
      )}
    >
      {/* Inner bar matches the page content width (same utilities as SECTION),
          so when scrolled it becomes a floating pill exactly that width. */}
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between border px-4 transition-all duration-300 sm:px-6",
          isPill
            ? "h-14 rounded-2xl border-border bg-background/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/30"
            : "h-16 border-transparent",
        )}
      >
        <HeaderLogo />
        <NavDesktop links={navLinks} />
        <HeaderActions navLinks={navLinks} githubStars={githubStars} />
      </div>
    </header>
  );
}
