// Pastel accent palette — peach / lavender / mint.
// Used sparingly as low-opacity decorative glows; the base system is neutral.
export const PEACH = "#FFB38E";
export const LAVENDER = "#D4B3FF";
export const MINT = "#A1EEBD";

// Page width wrapper — single source of truth for the landing/sponsors content
// width. Plain Tailwind utilities (not the `container` class) so it can't be
// overridden by the configured `.container` utility, which has wider max-widths
// and no centering/padding (that collision left-shifted the whole page).
// Equivalent to: max-w-6xl (72rem), centered, px-4 / sm:px-6.
export const SECTION = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export const GITHUB_URL = "https://github.com/kapishdima/remocn";

/** Canonical example install command shown on the landing page. */
export const INSTALL_COMMAND = "npx shadcn@latest add remocn/blur-reveal";

export const SPRING_BOUNCE = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};
export const SPRING_SOFT = {
  type: "spring" as const,
  stiffness: 180,
  damping: 22,
};

export type NavLink = {
  href: string;
  label: string;
  /** Hidden on mobile (matches the existing `hidden sm:inline` pattern). */
  smOnly?: boolean;
};

// Single source of truth for the top nav. "Components" sends people straight
// into the docs (typography is the first component category), so every surface
// — landing, sponsors, docs — shares the same three root-absolute links and the
// menu reads identically wherever it's mounted.
const MAIN_NAV: NavLink[] = [
  { href: "/docs/typography", label: "Components" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/docs/getting-started/introduction", label: "Docs" },
];

export const HOME_NAV: NavLink[] = MAIN_NAV;

export const SPONSORS_NAV: NavLink[] = MAIN_NAV;

export const DOCS_NAV: NavLink[] = MAIN_NAV;

export const FOOTER_NAV: NavLink[] = [
  { href: "/docs/getting-started/introduction", label: "Docs" },
  { href: GITHUB_URL, label: "GitHub" },
  { href: "/sponsors", label: "Sponsors" },
];
