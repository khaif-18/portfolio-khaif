import type { MouseEvent } from "react";
import { Link, type LinkProps } from "react-router";
import { useWipe } from "./useWipe";

type Props = Omit<LinkProps, "to"> & { to: string };

/**
 * <Link> biasa (tetap <a href> asli), tapi klik kiri biasa memakai page wipe.
 * Ctrl/Cmd/Shift/klik tengah tetap membuka tab baru seperti link normal.
 */
export function WipeLink({ to, onClick, target, ...rest }: Props) {
  const wipeTo = useWipe();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (target && target !== "_self")
    ) {
      return;
    }
    e.preventDefault();
    void wipeTo(to);
  }

  return <Link to={to} target={target} onClick={handleClick} {...rest} />;
}
