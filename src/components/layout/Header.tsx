import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { NAV } from "../../content/nav";
import { profile } from "../../content/profile";
import { WipeLink } from "../transition/WipeLink";
import { ThemeToggle } from "./ThemeToggle";

function NavItem({
  id,
  label,
  onHome,
  onClick,
}: {
  id: string;
  label: string;
  onHome: boolean;
  onClick: () => void;
}) {
  const cls =
    "slant-sm block px-4 py-3 font-display text-base tracking-wide uppercase text-paper select-none transition-[background-color,scale] duration-150 hover:bg-red active:scale-95 active:bg-red-deep active:duration-75 md:py-1.5 md:text-sm lg:text-base";
  // di Home cukup scroll; dari halaman lain pindah route dulu (dengan wipe)
  return onHome ? (
    <a href={`#${id}`} className={cls} onClick={onClick}>
      {label}
    </a>
  ) : (
    <WipeLink to={`/#${id}`} className={cls} onClick={onClick}>
      {label}
    </WipeLink>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-ink/95 shadow-[0_4px_0_var(--color-red)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <WipeLink
          to="/"
          className="group flex items-center gap-2 py-2 select-none"
          aria-label="Home"
        >
          <span className="slant-sm bg-paper px-2.5 py-0.5 font-display text-xl text-red transition-[rotate,scale] group-hover:-rotate-3 group-active:scale-90 group-active:rotate-3">
            KE
          </span>
          <span className="font-display text-lg tracking-wider uppercase">{profile.shortName}</span>
        </WipeLink>

        <div className="flex items-center gap-3">
          <nav
            id="site-nav"
            aria-label="Main"
            className={`${open ? "block" : "hidden"} absolute inset-x-0 top-16 bg-ink px-5 pb-6 md:static md:block md:bg-transparent md:p-0`}
          >
            <ul className="flex flex-col gap-1 md:flex-row md:gap-0">
              {NAV.map((n) => (
                <li key={n.id}>
                  <NavItem {...n} onHome={onHome} onClick={() => setOpen(false)} />
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <button
            type="button"
            className="slant-sm min-h-11 bg-paper px-4 py-1.5 font-display text-ink uppercase select-none transition-[scale,background-color] active:scale-90 active:bg-red active:text-paper md:hidden"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
