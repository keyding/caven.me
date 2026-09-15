import type { Locale } from "./home";

export interface Project {
  id: string;
  title: string;
  website?: string;
  source?: string;
  content: Record<Locale, { role: string; intro: string }>;
}

// Copy is based on the supplied resume. Live link checks: docs/pwarelay-review.md.
export const projects: Project[] = [
  {
    id: "pwarelay",
    title: "PWARelay",
    website: "https://pwarelay.com",
    content: {
      en: {
        role: "Independent developer · Product architecture & full-stack engineering",
        intro:
          "PWA lifecycle infrastructure for web teams, bringing installation, offline caching, updates, push notifications, and observability into one integration. I designed and built the platform with TypeScript, React, Hono, and Cloudflare, turning these capabilities into reusable SDKs.",
      },
      zh: {
        role: "独立开发者 · 产品架构与全栈研发",
        intro:
          "面向 Web 团队的 PWA 全生命周期基础设施，围绕安装、离线缓存、版本更新、消息推送与可观测性提供统一接入能力。我基于 TypeScript、React、Hono 与 Cloudflare 设计并构建平台，将这些能力沉淀为可复用的 SDK。",
      },
    },
  },
];
