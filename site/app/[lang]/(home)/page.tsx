import Link from "next/link";

const translations = {
  en: {
    headline: "Cinematic video components for React",
    sub: "Production-ready Remotion animations, transitions and backgrounds. Install with the shadcn CLI and own the code.",
    cta: "Browse components",
    card1Title: "Brand-aligned tokens",
    card1Desc:
      "Every component ships with OKLCH color variables and Cormorant Display typography — no design overrides needed.",
    card2Title: "shadcn registry",
    card2Desc:
      "Install components with a single CLI command. You own the source — no black-box imports.",
    card3Title: "Remotion primitives",
    card3Desc:
      "Built on Remotion's programmatic rendering primitives. Compose, extend, render to MP4 at any resolution.",
  },
  fr: {
    headline: "Composants vidéo cinématiques pour React",
    sub: "Animations, transitions et arrière-plans Remotion prêts pour la production. Installez via la CLI shadcn et possédez le code.",
    cta: "Parcourir les composants",
    card1Title: "Tokens de marque alignés",
    card1Desc:
      "Chaque composant intègre des variables OKLCH et la typographie Cormorant Display — aucune surcharge de design requise.",
    card2Title: "Registre shadcn",
    card2Desc:
      "Installez les composants en une seule commande CLI. Vous possédez le code source — pas d'imports opaques.",
    card3Title: "Primitives Remotion",
    card3Desc:
      "Construit sur les primitives de rendu programmatique de Remotion. Composez, étendez, exportez en MP4 à n'importe quelle résolution.",
  },
} as const;

type Lang = keyof typeof translations;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = translations[(lang as Lang) ?? "en"] ?? translations.en;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--vantage-bg)",
        color: "var(--vantage-prose)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          borderBottom: "1px solid var(--vantage-border)",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "3.5rem",
          backgroundColor: "var(--vantage-bg)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--vantage-heading)",
            letterSpacing: "-0.01em",
          }}
        >
          Vantage Video Components
        </span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            href={`/${lang}/docs/getting-started`}
            style={{
              color: "var(--vantage-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-caption)",
              fontSize: "0.875rem",
            }}
          >
            {lang === "fr" ? "Démarrer" : "Getting Started"}
          </Link>
          <Link
            href={`/${lang}/docs/components`}
            style={{
              color: "var(--vantage-accent)",
              textDecoration: "none",
              fontFamily: "var(--font-caption)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {t.cta}
          </Link>
          <Link
            href={lang === "en" ? "/fr" : "/en"}
            style={{
              color: "var(--vantage-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-caption)",
              fontSize: "0.875rem",
              border: "1px solid var(--vantage-border)",
              padding: "0.25rem 0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            {lang === "en" ? "FR" : "EN"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "6rem 2rem 4rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--vantage-heading)",
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            maxWidth: "52rem",
          }}
        >
          {t.headline}
        </h1>
        {/* Amber accent line */}
        <div
          style={{
            width: "4rem",
            height: "4px",
            backgroundColor: "var(--vantage-accent)",
            marginBottom: "1.5rem",
          }}
        />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.125rem",
            color: "var(--vantage-warm-white)",
            lineHeight: 1.7,
            maxWidth: "40rem",
            marginBottom: "2.5rem",
          }}
        >
          {t.sub}
        </p>
        <Link
          href={`/${lang}/docs/components`}
          style={{
            display: "inline-block",
            backgroundColor: "var(--vantage-accent)",
            color: "var(--vantage-bg)",
            fontFamily: "var(--font-caption)",
            fontWeight: 600,
            fontSize: "0.9375rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
            transition: "opacity 200ms var(--ui-ease)",
          }}
        >
          {t.cta}
        </Link>
      </section>

      {/* Value props */}
      <section
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "2rem 2rem 6rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[
          { title: t.card1Title, desc: t.card1Desc },
          { title: t.card2Title, desc: t.card2Desc },
          { title: t.card3Title, desc: t.card3Desc },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: "var(--vantage-surface)",
              border: "1px solid var(--vantage-border)",
              borderRadius: "0.75rem",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "var(--vantage-heading)",
                marginBottom: "0.75rem",
              }}
            >
              {card.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                color: "var(--vantage-warm-white)",
                lineHeight: 1.65,
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--vantage-border)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          fontFamily: "var(--font-caption)",
          fontSize: "0.8125rem",
          color: "var(--vantage-muted)",
        }}
      >
        Vantage Video Components — VantageOS / ElPi Corp
      </footer>
    </div>
  );
}
