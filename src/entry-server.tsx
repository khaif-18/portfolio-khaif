import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { profile } from "./content/profile";
import { projects } from "./content/projects";
import { routes } from "./routes";

/**
 * Dipakai scripts/prerender.mjs saat build (Node, bukan browser).
 * Merender satu URL menjadi HTML isi #root.
 */
export async function render(url: string): Promise<string> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(new URL(url, "http://localhost")));
  if (context instanceof Response) throw new Error(`Redirect saat prerender: ${url}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );
}

const SITE = `${profile.name} · ${profile.role}`;

/** Halaman yang dibuat saat build + title/description masing-masing. */
export const pages: { url: string; file: string; title: string; description: string }[] = [
  {
    url: "/",
    file: "index.html",
    title: SITE,
    description:
      "Frontend Developer with 3+ years building React apps for telecom and enterprise clients. Data-heavy dashboards, charts, and maps.",
  },
  ...projects.map((p) => ({
    url: `/projects/${p.slug}`,
    // "<slug>.html", bukan "<slug>/index.html": /projects/<slug> (tanpa "/") langsung
    // tersaji di vite preview, Vercel (cleanUrls), Netlify, dan GitHub Pages
    file: `projects/${p.slug}.html`,
    title: `${p.name} · Khalifah Erian`,
    description: `${p.tagline}. ${p.overview}`,
  })),
  {
    // URL apa pun yang tidak ada: host menyajikan 404.html (lihat vercel.json / _redirects)
    url: "/404",
    file: "404.html",
    title: "Target not found · Khalifah Erian",
    description: SITE,
  },
];
