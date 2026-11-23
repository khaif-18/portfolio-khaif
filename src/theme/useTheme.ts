import { useSyncExternalStore } from "react";
import { getTheme, type Theme } from "./theme";

function subscribe(cb: () => void) {
  window.addEventListener("themechange", cb);
  return () => window.removeEventListener("themechange", cb);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "red");
}
