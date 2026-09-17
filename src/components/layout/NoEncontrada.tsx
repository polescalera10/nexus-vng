"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Página 404 de la web. La pintan `app/global-not-found.tsx` (URLs que no
 * casan con ninguna ruta) y el `not-found.tsx` de cada layout raíz (los
 * `notFound()` que lanzan las páginas). Ver la nota de `RootShell.tsx`.
 */
export function NoEncontrada() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-white">
      {/* Cabecera integrada */}
      <SiteHeader />

      {/* Contenido principal */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        {/* Fondo decorativo de pista de baile (luces tenues) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(113,233,201,0.07)_0%,rgba(48,228,236,0.04)_50%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#131316_0_24px,#0a0a0a_24px_48px)] opacity-40 pointer-events-none" />

        <div className="container-nexus relative z-10 flex flex-col items-center max-w-[650px]">
          {/* Ilustración de pasos de baile divertidos */}
          <Reveal>
            <svg
              className="w-44 h-44 text-neon-mint/80 mb-8 mx-auto motion-safe:animate-pulse"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Haz del foco (Spotlight) */}
              <path d="M50 0 L10 100 L90 100 Z" fill="url(#spotlight)" opacity="0.15" />
              
              {/* Huella Izquierda (Bien posicionada, siguiendo el compás) */}
              <g transform="translate(25, 48) rotate(-15) scale(0.65)" fill="currentColor">
                <ellipse cx="20" cy="30" rx="11" ry="19" />
                <circle cx="10" cy="5" r="3" />
                <circle cx="16" cy="3" r="3.5" />
                <circle cx="23" cy="4" r="3" />
                <circle cx="29" cy="7" r="2.5" />
                <circle cx="34" cy="11" r="2" />
              </g>
              
              {/* Huella Derecha (Paso perdido, pisando fuera o girada de más) */}
              <g transform="translate(50, 36) rotate(60) scale(0.65)" fill="url(#neonGrad)">
                <ellipse cx="20" cy="30" rx="11" ry="19" />
                <circle cx="10" cy="5" r="3" />
                <circle cx="16" cy="3" r="3.5" />
                <circle cx="23" cy="4" r="3" />
                <circle cx="29" cy="7" r="2.5" />
                <circle cx="34" cy="11" r="2" />
              </g>

              {/* Cruz divertida indicando el error de paso */}
              <path
                d="M 68 56 L 76 64 M 76 56 L 68 64"
                stroke="#30e4ec"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.95"
              />

              <defs>
                <linearGradient id="spotlight" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#b5f6af" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#30e4ec" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="neonGrad" x1="20" y1="10" x2="20" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#b5f6af" />
                  <stop offset="1" stopColor="#30e4ec" />
                </linearGradient>
              </defs>
            </svg>
          </Reveal>

          {/* Textos humorísticos */}
          <Reveal delay={0.06}>
            <span className="inline-block px-3 py-1 mb-4 rounded-full border border-neon-mint/30 font-body text-xs font-bold uppercase tracking-[0.18em] text-neon-mint bg-neon-mint/5">
              Error 404 · Paso Perdido
            </span>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[0.01em] text-white">
              ¡Ups! Te has quedado fuera de tiempo
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-6 font-body text-base md:text-lg text-white/70 leading-relaxed max-w-[50ch]">
              En el baile, como en la web, a veces se pierde el compás o se pisa al compañero. 
              No te preocupes, ¡vamos a retomar la coreografía antes de que termine la canción!
            </p>
          </Reveal>

          {/* Botones de acción */}
          <Reveal delay={0.24} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-[15px] rounded-md font-body font-bold text-[14px] text-ink bg-neon shadow-neon transition-[transform,box-shadow,background] duration-200 hover:-translate-y-[3px] hover:shadow-[0_20px_44px_-8px_rgba(48,228,236,0.6)] active:translate-y-0 active:scale-[0.99] no-underline"
            >
              Volver a la pista (Inicio)
            </Link>
            
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-8 py-[15px] rounded-md font-body font-bold text-[14px] text-white/85 bg-transparent border border-white/30 transition-[transform,background] duration-200 hover:-translate-y-[3px] hover:bg-white/10 active:translate-y-0 active:scale-[0.99]"
            >
              Retomar el paso anterior
            </button>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
