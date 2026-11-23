import "@fontsource-variable/inter";
import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource/anton";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { RootLayout } from "./app/RootLayout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";
import { restorePrefs } from "./lib/prefs";

restorePrefs();

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: NotFound,
    children: [
      { index: true, Component: Home },
      // Tidak di-lazy: chunk-nya cuma ±2 KB gzip, sedangkan lazy menambah satu round-trip
      // di rantai HTML -> JS -> chunk -> render -> gambar LCP (Lighthouse mobile: +1.4 s LCP).
      { path: "projects/:slug", Component: ProjectDetail },
      { path: "*", Component: NotFound },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
