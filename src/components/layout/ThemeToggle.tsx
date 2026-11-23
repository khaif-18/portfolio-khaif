import { applyTheme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";
import { useWipeRun } from "../transition/useWipe";

/** Ganti tema merah <-> biru di balik panel wipe. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const run = useWipeRun();
  const next = theme === "red" ? "blue" : "red";

  return (
    <button
      type="button"
      onClick={() => void run(() => applyTheme(next))}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`group slant-sm flex items-center gap-2 bg-paper px-3 py-1.5 font-display text-sm tracking-wide text-ink uppercase select-none transition-[rotate,scale,background-color,color] hover:-rotate-2 active:scale-90 active:rotate-2 active:bg-ink active:text-paper pointer-coarse:min-h-11 ${className}`}
    >
      <span
        aria-hidden
        className={`h-2.5 w-2.5 rotate-45 transition-[background-color,scale] group-active:scale-150 ${next === "blue" ? "bg-[#0861ff]" : "bg-[#e00012]"}`}
      />
      {next}
    </button>
  );
}
