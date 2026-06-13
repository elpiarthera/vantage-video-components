import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <RootProvider
          locale={lang}
          theme={{ defaultTheme: "dark", enableSystem: false }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
