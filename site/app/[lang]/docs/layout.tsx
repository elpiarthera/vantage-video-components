import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { baseOptions } from "@/app/layout.config";
import { i18n } from "@/lib/i18n";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = i18n.languages.includes(lang as "en" | "fr")
    ? (lang as "en" | "fr")
    : i18n.defaultLanguage;

  return (
    <DocsLayout tree={source.pageTree[locale]} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
