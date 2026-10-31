"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const IntroScene = dynamic(() => import("@/components/scenes/IntroScene"), { ssr: false });

/** The shortest time the dial takes to fill, so the loading moment reads even on fast connections. */
const MIN_LOAD_MS = 2600;

/**
 * Opening of RayMindset: a dial of light fills on an endless floor while the page loads,
 * then invites the visitor in. Entering raises a column of light out of the dial, and
 * `onEnter` lets the world start loading behind the welcome; `onEntered` hands over once
 * the light has flooded the screen.
 */
export default function Intro({ mode, mobile, onEnter, onEntered }) {
  // loading → ready → entering → entered
  const [phase, setPhase] = useState("loading");
  const [percent, setPercent] = useState(0);
  const scene = useRef({ progress: 0, target: 0, ready: false, entering: false, rise: 0, hover: false });

  const onReady = useCallback(() => setPhase("ready"), []);
  useEffect(() => {
    scene.current.onReady = onReady;
  }, [onReady]);

  // Progress follows the page's real loading (document and fonts), never faster than MIN_LOAD_MS.
  useEffect(() => {
    if (mode === "pending") return;
    if (mode === "static") {
      const id = requestAnimationFrame(() => setPhase("ready"));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    let loaded = document.readyState === "complete" ? 1 : 0.6;
    const onLoad = () => (loaded = 1);
    window.addEventListener("load", onLoad);
    let fontsDone = false;
    document.fonts?.ready.then(() => (fontsDone = true));
    let raf = 0;
    const tick = () => {
      const time = Math.min(1, (performance.now() - start) / MIN_LOAD_MS);
      const real = loaded * (fontsDone ? 1 : 0.9);
      const target = Math.min(time, real);
      scene.current.target = target;
      setPercent(Math.round(scene.current.progress * 100));
      if (target < 1 || scene.current.progress < 0.995) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, [mode]);

  const enter = useCallback(() => {
    if (phase !== "ready") return;
    scene.current.entering = true;
    setPhase("entering");
    onEnter?.();
    window.setTimeout(() => {
      setPhase("entered");
      onEntered?.();
    }, mode === "3d" ? 4300 : 1800);
  }, [phase, mode, onEnter, onEntered]);

  // Enter or Space anywhere enters once ready.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (phase === "ready") {
          e.preventDefault();
          enter();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, enter]);

  return (
    <div className={`intro is-${mode} phase-${phase}`} onClick={phase === "ready" ? enter : undefined}>
      {mode === "3d" && <IntroScene state={scene} mobile={mobile} />}

      <p className="intro-mark">RayMindset</p>

      <p className="sr-only" role="status" aria-live="polite">
        {phase === "loading" ? `Loading Ray's mind, ${percent}%` : phase === "ready" ? "Ready to enter" : ""}
      </p>

      <div className="intro-invite" aria-hidden={phase !== "ready"}>
        <button
          type="button"
          className="intro-enter"
          onClick={(e) => {
            e.stopPropagation();
            enter();
          }}
          onPointerEnter={() => (scene.current.hover = true)}
          onPointerLeave={() => (scene.current.hover = false)}
          tabIndex={phase === "ready" ? 0 : -1}
        >
          Click to enter
        </button>
        <p className="intro-hint">or press Enter</p>
      </div>

      {/* The welcome lands in the column of light, then the light floods the screen. */}
      <div className="intro-welcome" aria-hidden={phase === "loading" || phase === "ready"}>
        <p className="intro-welcome-small">Welcome to</p>
        <p className="intro-welcome-big" aria-label="RayMindset">
          {"RAYMINDSET".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ "--i": i }}>
              {ch}
            </span>
          ))}
        </p>
        <p className="intro-welcome-line">The mind of Rayansh Singh</p>
      </div>
      <div className="intro-flash" aria-hidden="true" />
    </div>
  );
}
