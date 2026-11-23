import { LazyMotion, MotionConfig } from "motion/react";
import { Outlet, ScrollRestoration } from "react-router";
import { PressFx } from "../components/fx/PressFx";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { ScrollHud } from "../components/layout/ScrollHud";
import { WipeProvider } from "../components/transition/WipeProvider";

const loadFeatures = () => import("./motionFeatures").then((m) => m.default);

export function RootLayout() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <WipeProvider>
          <a
            href="#main"
            className="sr-only z-60 bg-red px-4 py-2 font-display text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <Header />
          <ScrollHud />
          <PressFx />
          <main id="main">
            <Outlet />
          </main>
          <Footer />
          <ScrollRestoration />
        </WipeProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
