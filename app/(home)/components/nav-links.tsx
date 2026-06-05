"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { type NavLink } from "@/config/landing";
import { cn } from "@/lib/utils";

/**
 * Desktop nav whose items behave like ghost buttons: a single rounded
 * background tracks the hovered (or keyboard-focused) item and springs from one
 * to the next instead of popping. Rendered once and animated via transform, so
 * moving between items reads as the same pill sliding across the row. Hidden
 * below `sm`, where the header falls back to the mobile sheet.
 */
export function NavLinks({
  links,
  className,
}: {
  links: NavLink[];
  className?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const [highlight, setHighlight] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // Measure the item relative to the nav so the pill can be positioned with a
  // transform (left:0 + translateX) rather than animating layout.
  const moveTo = (el: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setHighlight({ left: elRect.left - navRect.left, width: elRect.width });
  };

  return (
    <nav
      ref={navRef}
      onMouseLeave={() => setHighlight(null)}
      // Retract the pill once focus leaves the nav entirely (not while tabbing
      // between items), mirroring the mouse-leave behaviour for keyboard users.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHighlight(null);
        }
      }}
      className={cn("relative hidden items-center gap-1 sm:flex", className)}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-full rounded-full bg-muted"
        initial={false}
        animate={{
          x: highlight?.left ?? 0,
          width: highlight?.width ?? 0,
          opacity: highlight ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
      />
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onMouseEnter={(event) => moveTo(event.currentTarget)}
          onFocus={(event) => moveTo(event.currentTarget)}
          className="relative rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
