import { defineDocs, defineConfig } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  i18n: true,
});

export default defineConfig({
  i18n: true,
});
