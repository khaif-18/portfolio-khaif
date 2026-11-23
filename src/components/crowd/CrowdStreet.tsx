import { CrowdWalk } from "./CrowdWalk";

/**
 * Pembatas antar-section: "trotoar" hitam dengan dua lajur pejalan kaki
 * berlawanan arah. Lajur belakang lebih gelap dan lambat supaya terasa dalam.
 */
export function CrowdStreet({ caption }: { caption?: string }) {
  return (
    <div className="relative overflow-hidden border-y-4 border-red bg-ink">
      <div className="halftone pointer-events-none absolute inset-0 text-paper/[0.04]" />
      <CrowdWalk
        count={10}
        height="9rem"
        speed={38}
        direction="right"
        seed={17}
        className="absolute inset-x-0 bottom-3 opacity-20"
      />
      <CrowdWalk count={9} height="12rem" speed={24} seed={42} className="relative opacity-90" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-red" />
      {caption && (
        <p className="absolute top-4 left-1/2 -translate-x-1/2 -rotate-2 bg-paper px-4 py-1 font-display tracking-[0.3em] text-ink uppercase">
          {caption}
        </p>
      )}
    </div>
  );
}
