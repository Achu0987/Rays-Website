"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { compass, connect, pillars } from "@/lib/content/home";
import SiteFooter from "@/components/layout/SiteFooter";

const WorldScene = dynamic(() => import("@/components/scenes/WorldScene"), { ssr: false });

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Words that blur and rise into place one after another when their block enters view. */
function BlurWords({ text, className, as: Tag = "span" }) {
  return (
    <Tag className={`k-words ${className ?? ""}`} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true" style={{ "--i": i }}>
          {w}&nbsp;
        </span>
      ))}
    </Tag>
  );
}

/**
 * The world behind the door: the warm compass room. One fixed 3D scene, driven by an
 * ordinary scrolling page; `compass` is the scroll position across the whole section.
 */
export default function World({ mode, mobile }) {
  const world = useRef({ compass: 0, compassTarget: 0, velocity: 0 });
  const lenis = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const smooth = mode === "3d" ? new Lenis({ autoRaf: true, lerp: 0.075, wheelMultiplier: 0.9 }) : null;
    lenis.current = smooth;
    const cards = document.getElementById("pillars");
    const update = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const cardsEnd = cards.offsetTop + cards.offsetHeight;
      world.current.compassTarget = clamp01((y + vh * 0.35) / (cardsEnd - vh * 0.65));
      world.current.cardsNear = y > cards.offsetTop - vh * 0.9;
      if (track.current) {
        // 3D carousel: scroll turns the ring one card at a time, holding on each.
        // The ring turns through the first 82% of the section, then holds on the last card.
        const frac = clamp01((y - cards.offsetTop) / (cards.offsetHeight - vh));
        const local = clamp01(frac / 0.82);
        const steps = pillars.length - 1;
        const raw = local * steps;
        const i = Math.min(steps - 1, Math.floor(raw));
        const f = clamp01((raw - i - 0.3) / 0.5);
        const held = local >= 1 ? steps : i + f * f * (3 - 2 * f);
        const step = 360 / pillars.length;
        track.current.style.setProperty("--turn", `${-held * step}deg`);
        const front = Math.round(held);
        // The first and last cards keep the site's dark room; the four between bring their light colours.
        const inside = front > 0 && front < pillars.length - 1;
        cards.classList.toggle("is-light", inside);
        if (inside) cards.style.setProperty("--room", pillars[front].bg);
        document.documentElement.classList.toggle("on-light", inside);
        track.current.querySelectorAll(".k-card").forEach((card, k) => {
          const facing = Math.cos(((k - held) * step * Math.PI) / 180);
          card.style.setProperty("--facing", facing.toFixed(3));
          card.classList.toggle("is-front", Math.abs(k - held) < 0.5);
        });
      }
    };
    smooth?.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.45 },
    );
    document.querySelectorAll(".k-reveal").forEach((el) => reveal.observe(el));
    update();
    return () => {
      smooth?.destroy();
      reveal.disconnect();
      document.documentElement.classList.remove("on-light");
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mode]);

  const scrollToY = (y) => {
    if (lenis.current) lenis.current.scrollTo(y, { duration: 2.2 });
    else window.scrollTo({ top: y });
  };

  return (
    <div className={`world is-${mode}`}>
      {mode === "3d" && <WorldScene world={world} mobile={mobile} />}
      <div className="edge-glow" aria-hidden="true" />

      <header className="world-nav">
        <a className="world-mark" href="#top" onClick={(e) => (e.preventDefault(), scrollToY(0))}>
          RayMindset
        </a>
        <nav className="pill" aria-label="Main">
          <a href="#pillars" onClick={(e) => (e.preventDefault(), scrollToY(document.getElementById("pillars").offsetTop))}>
            Pillars
          </a>
        </nav>
      </header>

      <main id="top">
        <section id="compass" className="k-section k-hero" aria-labelledby="k-title">
          <div className="k-pin">
            <div className="k-title-wrap k-reveal">
              <h1 id="k-title" className="k-title">
                <BlurWords text={compass.title} />
                <sup className="k-star" aria-hidden="true">*</sup>
              </h1>
              <p className="k-label">{compass.label}</p>
            </div>
            <p className="k-hint">Move your cursor. The needle follows.</p>
            <p className="k-footnote">* {compass.footnote}</p>
          </div>
        </section>

        <section className="k-section k-open" aria-label={compass.open}>
          <div className="k-pin">
            <p className="k-statement k-reveal">
              <BlurWords text={compass.open} />
            </p>
          </div>
        </section>

        <section className="k-section k-ghost" aria-hidden="true">
          <div className="k-pin">
            <p className="k-ghost-word">RAYMINDSET</p>
          </div>
        </section>

        <section id="pillars" className="k-section k-cards" aria-labelledby="k-pillars-title">
          <div className="k-pin k-cards-pin">
            <h2 id="k-pillars-title" className="k-cards-title k-reveal">
              <BlurWords text="Six things I keep coming back to." />
            </h2>
            <ol ref={track} className="k-ring" style={{ "--count": pillars.length }}>
              {pillars.map((p, i) => (
                <li key={p.id} className="k-card" style={{ "--tone": p.tone, "--i": i }}>
                  <h3>{p.title}</h3>
                  <p>{p.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter email={connect.email} onTop={() => scrollToY(0)} />
    </div>
  );
}
