import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Vantage Video Components",
  },
  links: [
    {
      text: "Components",
      url: "/docs/components",
      active: "nested-url",
    },
    {
      text: "Getting Started",
      url: "/docs/getting-started",
      active: "nested-url",
    },
  ],
};
