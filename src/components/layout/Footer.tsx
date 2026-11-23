import { profile } from "../../content/profile";
import { Sprite } from "../ui/Sprite";

export function Footer() {
  return (
    <footer className="border-t-4 border-red bg-ink px-5 py-8 text-sm text-paper/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Sprite name="fin" alt="Fin." className="w-24 -rotate-6 md:order-last md:w-28" />
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Vite, React, Motion &amp;
          Tailwind.
        </p>
        <p className="text-xs text-paper/65">
          Non-commercial fan tribute. Persona 5 UI artwork © ATLUS / SEGA.
        </p>
      </div>
    </footer>
  );
}
