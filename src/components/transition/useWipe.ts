import { createContext, useContext } from "react";

export type WipeTo = (to: string) => Promise<void>;
/** Jalankan aksi apa pun di balik panel wipe (ganti route, ganti tema, ...). */
export type WipeRun = (action: () => unknown | Promise<unknown>) => Promise<void>;

export const WipeContext = createContext<{ go: WipeTo; run: WipeRun } | null>(null);

function useWipeContext() {
  const ctx = useContext(WipeContext);
  if (!ctx) throw new Error("useWipe harus dipakai di dalam <WipeProvider>");
  return ctx;
}

export function useWipe(): WipeTo {
  return useWipeContext().go;
}

export function useWipeRun(): WipeRun {
  return useWipeContext().run;
}
