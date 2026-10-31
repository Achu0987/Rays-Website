"use client";

import { useEffect, useRef, useState } from "react";
import scans from "../../../public/assets/models/credits.json";

// Ray's portrait (from gosocialsect.com/about, Socialsect's own site). Replace with an approved shoot when ready.
const PORTRAIT = "/assets/images/ray.webp";

/**
 * The close of the page: Ray's photo as a window between the two halves of his name,
 * which slide in from either side as the footer rises into view.
 */
export default function SiteFooter({ email, onTop }) {
  const ref = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(true);

  useEffect(() => {
    const el = ref.current;
    const update = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (window.innerHeight - r.top) / r.height));
      el.style.setProperty("--rise", k.toFixed(3));
      // The top bar steps aside once the footer owns the screen.
      document.documentElement.classList.toggle("at-footer", r.top < window.innerHeight * 0.6);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.classList.remove("at-footer");
    };
  }, []);

  return (
    <footer ref={ref} className={`f-footer${hasPhoto ? "" : " no-photo"}`}>
      <div className="f-head">
        <h2 className="f-title">Good conversations change things.</h2>
        <a className="f-cta" href={`mailto:${email}?subject=${encodeURIComponent("Hello Ray")}`}>
          Say hello <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="f-stage" aria-hidden="true">
        <p className="f-name f-name-back">RAYANSH</p>
        {hasPhoto && (
          <div className="f-window">
            {/* eslint-disable-next-line @next/next/no-img-element -- local portrait, sized by the stage */}
            <img className="f-portrait" src={PORTRAIT} alt="" onError={() => setHasPhoto(false)} />
          </div>
        )}
        <div className="f-glow" />
        <p className="f-name f-name-front">SINGH</p>
      </div>
      <p className="sr-only">Rayansh Singh</p>

      <div className="f-base">
        <p>© {new Date().getFullYear()} RayMindset</p>
        <p className="f-credit">
          Compass: <a href={scans[0].source}>{scans[0].title}</a>, CC0, Poly Haven
        </p>
        <button type="button" className="f-top" onClick={onTop}>
          Back to the top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
