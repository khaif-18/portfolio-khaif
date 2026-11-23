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

export interface Page {
  url: string;
  file: string;
  title: string;
  description: string;
  /** path gambar preview link di public/ (dibuat tools/og_images.py) */
  image: string;
  imageAlt: string;
  /** true: tidak diindeks, tanpa canonical, tidak masuk sitemap */
  noindex?: boolean;
  /** structured data JSON-LD; `site` = origin absolut tanpa "/" di akhir */
  schema?: (site: string) => object;
}

const SITE = `${profile.name} · ${profile.role}`;
const employer = profile.facts.find((f) => f.label === "Now at")?.value;

const person = (site: string) => ({
  "@type": "Person",
  "@id": `${site}/#person`,
  name: profile.name,
  // variasi nama yang orang ketik di Google; dibaca sebagai nama orang yang sama
  alternateName: ["Khalifah Erian", "Erian"],
  givenName: "Muhammad Khalifah",
  familyName: "Erian",
  jobTitle: profile.role,
  url: `${site}/`,
  image: `${site}/og/home.png`,
  address: { "@type": "PostalAddress", addressLocality: profile.location },
  ...(employer && { worksFor: { "@type": "Organization", name: employer } }),
  knowsAbout: [
    "React",
    "TypeScript",
    "Data visualization",
    "Geospatial maps",
    "Frontend development",
  ],
  sameAs: profile.links.map((l) => l.href).filter((h) => h.startsWith("https://")),
});

/** Halaman yang dibuat saat build + metadata masing-masing. */
export const pages: Page[] = [
  {
    url: "/",
    file: "index.html",
    title: SITE,
    description:
      "Frontend Developer with 3+ years building React apps for telecom and enterprise clients. Data-heavy dashboards, charts, and maps.",
    image: "/og/home.png",
    imageAlt: `${profile.name}, ${profile.role}`,
    schema: (site) => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${site}/#website`,
          name: profile.name,
          alternateName: "Khalifah Erian",
          url: `${site}/`,
          author: { "@id": `${site}/#person` },
        },
        person(site),
      ],
    }),
  },
  ...projects.map((p): Page => ({
    url: `/projects/${p.slug}`,
    // "<slug>.html", bukan "<slug>/index.html": /projects/<slug> (tanpa "/") langsung
    // tersaji di vite preview, Vercel (cleanUrls), Netlify, dan GitHub Pages
    file: `projects/${p.slug}.html`,
    title: `${p.name} · Khalifah Erian`,
    description: `${p.tagline}. ${p.overview}`,
    image: `/og/${p.slug}.png`,
    imageAlt: `${p.name}: ${p.tagline}`,
    schema: (site) => ({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.name,
      headline: `${p.name}: ${p.tagline}`,
      description: p.overview,
      url: `${site}/projects/${p.slug}`,
      image: `${site}/og/${p.slug}.png`,
      keywords: p.stack.join(", "),
      creativeWorkStatus: p.status === "live" ? "Published" : "Incomplete",
      ...(p.liveUrl && { sameAs: p.liveUrl }),
      author: { "@type": "Person", "@id": `${site}/#person`, name: profile.name, url: `${site}/` },
      isPartOf: { "@type": "WebSite", "@id": `${site}/#website` },
    }),
  })),
  {
    // URL apa pun yang tidak ada: host menyajikan 404.html (lihat vercel.json / _redirects)
    url: "/404",
    file: "404.html",
    title: "Target not found · Khalifah Erian",
    description: SITE,
    image: "/og/home.png",
    imageAlt: `${profile.name}, ${profile.role}`,
    noindex: true,
  },
];
