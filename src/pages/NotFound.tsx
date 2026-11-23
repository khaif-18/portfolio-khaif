import { isRouteErrorResponse, useRouteError } from "react-router";
import { RansomText } from "../components/ransom/RansomText";
import { Button } from "../components/ui/Button";
import { Sprite } from "../components/ui/Sprite";

/**
 * Dipakai untuk route "*" dan sebagai ErrorBoundary root.
 * Sengaja tidak memakai WipeLink, karena saat error, WipeProvider tidak ter-render.
 */
export function NotFound() {
  const error = useRouteError();
  const crashed = error !== undefined && !(isRouteErrorResponse(error) && error.status === 404);

  return (
    <section className="stripes relative grid min-h-[100svh] place-items-center overflow-hidden bg-ink px-5 py-28 text-paper">
      <div className="flex flex-col items-center gap-10 text-center md:flex-row md:text-left">
        <Sprite
          name="failed"
          alt="Mission failed"
          loading="eager"
          className="w-48 rotate-[-6deg] shadow-[10px_10px_0_var(--color-paper)] md:w-60"
        />
        <div>
          <p className="mb-3 font-display tracking-[0.3em] text-red-bright uppercase">
            {crashed ? "Something broke" : "Error 404"}
          </p>
          <RansomText
            as="h1"
            text={crashed ? "MISSION FAILED" : "TARGET NOT FOUND"}
            animate={false}
            className="mb-6 block max-w-lg text-5xl sm:text-6xl"
          />
          <p className="mb-8 max-w-md text-lg text-paper/80">
            {crashed
              ? "An unexpected error occurred. Try heading back to the hideout."
              : "This page slipped out of the Metaverse. Let's get you back to safety."}
          </p>
          <Button href="/">Back to hideout</Button>
        </div>
      </div>
    </section>
  );
}
