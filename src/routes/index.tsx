import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Embers } from "@/components/invitation/Embers";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";
import { BatSwarm } from "@/components/invitation/BatSwarm";

// lottie-react bundles ~250KB of lottie-web under the hood, and we only
// need it AFTER the guest clicks the closed carta. Lazy-loading keeps
// that weight out of the initial JS payload so Motion (and the carta
// fade-in / spider animations) can hydrate within ~1s on the dev
// server instead of waiting 10s+ for the full bundle to parse.
const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

const DEFAULT_TITLE = "Halloween Party — Você Está Convidado";
const DEFAULT_DESCRIPTION =
  "Abra o envelope e descubra os detalhes da nossa festa de Halloween: 31 de outubro, fantasia obrigatória. Confirme sua presença.";

// Carta aberta slide-out: how long the carta holds before sliding off,
// and how long the slide takes.
const HOLD_MS = 900;
const SLIDE_OUT_MS = 800;
// Convite (verso/frente): delay + duration of the entry grow, and
// duration of the 3D flip on click.
const LEAF_DELAY_MS = 350;
const LEAF_GROW_MS = 900;
const FLIP_MS = 650;

type Search = {
  name?: string;
  id?: number;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const result: Search = {};
    if (typeof search["name"] === "string") result.name = search["name"];
    if (typeof search["id"] === "string") {
      const n = Number.parseInt(search["id"], 10);
      if (Number.isFinite(n) && n > 0) result.id = n;
    }
    return result;
  },
  head: () => ({
    meta: [
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);
  const [sliding, setSliding] = useState(false);
  // Frente (outside) is the default face after the carta opens; click
  // flips to verso (inside), second click flips back to frente.
  const [showFrente, setShowFrente] = useState(true);
  const { name } = Route.useSearch();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "Halloween Party — Você Está Convidado";
    document.title = name ? `${name}, ${base}` : base;
  }, [name]);

  // After the open carta settles, wait HOLD_MS then trigger the
  // slide-out by flipping `sliding` to true.
  useEffect(() => {
    if (!open || sliding) return;
    const t = setTimeout(() => setSliding(true), HOLD_MS);
    return () => clearTimeout(t);
  }, [open, sliding]);

  // Preload + play the bat SFX on first user gesture (the click that
  // opens the carta). Most browsers block autoplay until the user has
  // interacted with the page, so wiring it to handleClickCarta is
  // the reliable way to unlock the AudioContext. We construct one
  // Audio element per session and reuse it — no need to recreate on
  // every flip. Volume is dialed back to 0.55 because the source is
  // louder than comfortable at full gain.
  //
  // The background soundtrack (background-sound-hallowen.mp3, loop)
  // is also started here, at 0.6 volume. Both unlock together off
  // the same gesture.
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  function handleClickCarta() {
    if (typeof window !== "undefined") {
      if (!sfxRef.current) {
        const a = new Audio("/som-morcego.mp3");
        a.preload = "auto";
        a.volume = 0.55;
        sfxRef.current = a;
      }
      if (!bgmRef.current) {
        const bg = new Audio("/background-sound-hallowen.mp3");
        bg.loop = true;
        bg.volume = 0.6;
        bg.preload = "auto";
        bgmRef.current = bg;
      }
    }
    sfxRef.current?.play().catch(() => {
      // Autoplay rejected (shouldn't happen — click is the gesture)
    });
    // BGM has to .catch() too for the same reason. If the first
    // .play() rejects (mobile Safari et al.), it stays silent for
    // the rest of the session — better than spamming errors.
    bgmRef.current?.play().catch(() => {});
    setOpen(true);
  }

  function handleClickLeaf() {
    setShowFrente((prev) => !prev);
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-crimson px-4 py-16">
      <div className="pointer-events-none absolute inset-0 spooky-vignette" aria-hidden="true" />
      <Embers />
      <SpiderOverlay />
      <BatSwarm active={open} />

      {/* Envelope (closed / open). Centered, max-w-xl. */}
      <div className="relative z-30 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="closed"
              type="button"
              onClick={handleClickCarta}
              aria-label="Abrir o convite"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson"
            >
              <img
                src="/carta-fechada.svg"
                alt="Carta de Halloween fechada"
                draggable={false}
                className="block h-auto w-full select-none bg-transparent transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.button>
          )}

          {open && (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.7, y: 60 }}
              animate={sliding ? { opacity: 0, y: "100vh" } : { opacity: 1, scale: 1, y: 0 }}
              transition={
                sliding
                  ? { duration: SLIDE_OUT_MS / 1000, ease: [0.55, 0, 1, 0.45] }
                  : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }
              className="relative w-full"
            >
              <img
                src="/carta-aberta.svg"
                alt="Carta de Halloween aberta"
                draggable={false}
                className="block h-auto w-full select-none bg-transparent"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Convite (verso / frente). Sibling of the envelope, full-viewport
          centered layer so it sits in the middle of the screen regardless
          of the envelope's max-w-xl width. Stays after the carta slides
          off — the user can keep flipping it.

          We avoid CSS 3D flip cards (backface-visibility + rotateY) here
          because they fight with Motion's transform composition during
          the entry animation, causing the wrong face to flash in. Instead
          we use a simple opacity cross-fade on click. It's less
          physically realistic but rock-solid visually. */}
      {open && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <motion.button
            type="button"
            onClick={handleClickLeaf}
            aria-label={showFrente ? "Mostrar verso do convite" : "Mostrar frente do convite"}
            // 2D "flip" illusion via scaleX keyframes: 1 -> -1 -> 1.
            // The face swap (opacity cross-fade) happens AT the same
            // time, so the viewer only ever sees the verso mirrored
            // briefly mid-flip, never at rest. The end state is back
            // to scaleX: 1, so the verso JPG renders with its natural
            // orientation when shown.
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ duration: FLIP_MS / 1000, ease: "easeInOut" }}
            className="pointer-events-auto relative w-[85vw] max-w-[420px] cursor-pointer select-none appearance-none border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson sm:w-[40vw] sm:max-w-md"
          >
            {/* Guest name from the URL ?name=... param. Renders ONLY on
                the frente face — the verso has its own layout and doesn't
                have the "VOCÊ É NOSSO CONVIDADO (A)" line under it.

                Position: dead center of the convite (top-1/2 + translate),
                right where the designer's "VOCÊ É NOSSO CONVIDADO (A)"
                caption sits in convite-frente.jpg. Sized large so it
                reads as the actual personalized invitation line, not a
                floating label. z-20 keeps it above the frente image's
                stacking context.

                Fade-in matches the LeafEntry entry so the name appears
                in lockstep with the card settling, not before it (which
                looked like it was "flashing then vanishing"). */}
            {showFrente && name && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: (LEAF_DELAY_MS + LEAF_GROW_MS) / 1000,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center font-display text-3xl uppercase tracking-[0.2em] text-pumpkin sm:text-4xl"
                style={{ textShadow: "0 2px 6px rgba(0,0,0,0.85)" }}
              >
                {name}
              </motion.div>
            )}

            {/* Lottie click hint anchored to the bottom-right corner of
                the convite itself (not the viewport). z-30 so it floats
                above the JPG faces. pointer-events-none so the convite
                click handler still fires when the user taps near it.
                Wrapped in Suspense because the Lottie component itself
                is lazy-loaded (it pulls in ~250KB of lottie-web). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-2 z-30 w-16 sm:bottom-3 sm:right-3 sm:w-20"
            >
              <Suspense fallback={null}>
                <Lottie src="/click.json" loop autoplay />
              </Suspense>
            </div>

            <LeafEntry delayMs={LEAF_DELAY_MS} growMs={LEAF_GROW_MS}>
              {/* Verso face. Cross-fades out when showFrente=true, in
                  when false. Stacks on top of frente via z-10. */}
              <motion.img
                src="/convite-verso.jpg"
                alt="Verso do convite de Halloween"
                draggable={false}
                animate={{ opacity: showFrente ? 0 : 1 }}
                transition={{ duration: FLIP_MS / 1000, ease: "easeInOut" }}
                className="absolute inset-0 z-10 block w-full select-none bg-transparent object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
              {/* Frente face. Visible by default (showFrente=true). */}
              <motion.img
                src="/convite-frente.jpg"
                alt="Frente do convite de Halloween"
                draggable={false}
                animate={{ opacity: showFrente ? 1 : 0 }}
                transition={{ duration: FLIP_MS / 1000, ease: "easeInOut" }}
                className="block w-full select-none bg-transparent object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </LeafEntry>
          </motion.button>
        </div>
      )}
    </main>
  );
}

/**
 * Owns the "grow from a tiny centered mark to full size" entry
 * animation. The flip is on the parent so they don't fight each
 * other for the same transform property.
 */
function LeafEntry({
  delayMs,
  growMs,
  children,
}: {
  delayMs: number;
  growMs: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      // 3-phase entry: small + invisible (0%) -> lifts out of envelope,
      // slightly larger and offset up (35%) -> settles to final size and
      // position (100%). Mimics a leaf being pulled out of an envelope
      // and then held up in front of the camera.
      //
      // NO rotate here: even rotateZ in a preserve-3d context can fight
      // with the parent flip's rotateY and cause the verso back face to
      // flash mid-entry. The static entry is enough.
      initial={{ opacity: 0, scale: 0.55, y: 0 }}
      animate={{
        opacity: [0, 1, 1],
        scale: [0.55, 0.7, 1],
        y: [0, -40, 0],
      }}
      transition={{
        delay: delayMs / 1000,
        duration: growMs / 1000,
        times: [0, 0.35, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
