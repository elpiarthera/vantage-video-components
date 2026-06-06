import { type NavLink, SECTION } from "@/config/landing";
import { NavFooter } from "./header-nav";

export function SiteFooter({
  navLinks,
  className = "",
}: {
  navLinks: NavLink[];
  className?: string;
}) {
  return (
    <div className={`${SECTION} ${className}`}>
      <footer className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 pb-12 text-sm text-muted-foreground md:flex-row md:items-center">
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} remocn — MIT licensed
        </span>
        <NavFooter links={navLinks} />
      </footer>
    </div>
  );
}
