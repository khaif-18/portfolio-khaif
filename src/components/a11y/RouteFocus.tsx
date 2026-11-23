import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { focusHeading } from "../../lib/announce";

/**
 * Di SPA, pindah halaman tidak memuat ulang dokumen: link yang diklik hilang,
 * fokus jatuh ke <body>, dan screen reader tidak tahu ada halaman baru.
 * Setelah route berganti, fokus dipindah ke judul halaman (h1), atau ke judul
 * section kalau URL punya hash (/#targets). Pembaca layar membacakan judul itu,
 * dan Tab berikutnya melanjutkan dari sana. Load pertama dilewati.
 */
export function RouteFocus() {
  const { pathname, hash, key } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // tunggu halaman (lazy) tergambar dan ScrollRestoration selesai
    const t = window.setTimeout(() => {
      const section = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      const target = section
        ? (section.querySelector<HTMLElement>("h2") ?? section)
        : document.querySelector<HTMLElement>("main h1");
      focusHeading(target);
    }, 50);
    return () => window.clearTimeout(t);
  }, [pathname, hash, key]);

  return null;
}

/** Live region global untuk announce(). */
export function Announcer() {
  return <div id="sr-announcer" role="status" aria-live="polite" className="sr-only" />;
}
