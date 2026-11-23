import type { RouteObject } from "react-router";
import { RootLayout } from "./app/RootLayout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";

/** Satu daftar rute untuk browser (main.tsx) dan prerender (entry-server.tsx). */
export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: NotFound,
    children: [
      { index: true, Component: Home },
      // Tidak di-lazy: chunk-nya cuma ±2 KB gzip, sedangkan lazy menambah satu round-trip
      // di rantai HTML -> JS -> chunk -> render -> gambar LCP. Lazy juga butuh penanganan
      // khusus saat hidrasi (chunk harus dimuat sebelum hydrateRoot).
      { path: "projects/:slug", Component: ProjectDetail },
      { path: "*", Component: NotFound },
    ],
  },
];
