import "@fontsource-variable/inter";
import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource/anton";
import "./index.css";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { restorePrefs } from "./lib/prefs";
import { routes } from "./routes";

restorePrefs();

declare global {
  interface Window {
    __staticRouterHydrationData?: unknown;
  }
}

const container = document.getElementById("root")!;

/**
 * HTML hasil prerender (scripts/prerender.mjs) menandai rute yang dirender di
 * data-prerendered. Kalau cocok dengan URL sekarang: hidrasi (pakai HTML yang sudah
 * ada). Kalau tidak cocok (mis. server dev / host yang menyajikan index.html untuk
 * semua URL): buang HTML-nya dan render biasa, supaya tidak ada hydration mismatch.
 */
const prerendered = container.dataset.prerendered;
const path = location.pathname.replace(/\/+$/, "") || "/";
const canHydrate = prerendered !== undefined && prerendered === path;
if (!canHydrate) delete window.__staticRouterHydrationData;

const router = createBrowserRouter(routes);
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

if (canHydrate) {
  hydrateRoot(container, app);
} else {
  container.textContent = "";
  createRoot(container).render(app);
}
