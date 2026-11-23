import { useSyncExternalStore } from "react";

/**
 * Preferensi kecil yang disimpan di localStorage dan dipasang sebagai atribut <html>
 * (supaya CSS bisa membacanya):
 *
 *   motion    : "paused" -> ticker, kerumunan, dan api berhenti (WCAG 2.2.2).
 *               Kalau diubah, ubah juga script anti-kedip di index.html.
 *   shortcuts : "off"    -> shortcut satu tombol dimatikan (WCAG 2.1.4).
 */
type Pref = "motion" | "shortcuts";
const KEY: Record<Pref, string> = { motion: "p5-motion", shortcuts: "p5-shortcuts" };
const ON_VALUE: Record<Pref, string> = { motion: "paused", shortcuts: "off" };
const EVENT = "p5prefchange";

/** true = motion dijeda / shortcut dimatikan */
export function getPref(pref: Pref): boolean {
  return document.documentElement.dataset[pref] === ON_VALUE[pref];
}

export function setPref(pref: Pref, on: boolean) {
  const html = document.documentElement;
  if (on) html.dataset[pref] = ON_VALUE[pref];
  else delete html.dataset[pref];
  try {
    if (on) localStorage.setItem(KEY[pref], ON_VALUE[pref]);
    else localStorage.removeItem(KEY[pref]);
  } catch {
    // mode privat: berlaku untuk sesi ini saja
  }
  window.dispatchEvent(new Event(EVENT));
}

/** dipanggil sekali saat start, untuk preferensi yang tidak dipasang oleh index.html */
export function restorePrefs() {
  try {
    for (const pref of Object.keys(KEY) as Pref[]) {
      if (localStorage.getItem(KEY[pref]) === ON_VALUE[pref])
        document.documentElement.dataset[pref] = ON_VALUE[pref];
    }
  } catch {
    // abaikan
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function usePref(pref: Pref): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getPref(pref),
    () => false,
  );
}
