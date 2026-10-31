# Decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-30 | Next.js 16.4 App Router, JavaScript only (no TypeScript) | Owner instruction overrides "TypeScript strict" in the original CLAUDE.md. JSDoc documents content shapes. |
| 2026-10-30 | Tailwind CSS v4 + CSS custom properties for tokens | Tailwind is named in the original CLAUDE.md. The tokens are exploration values from DESIGN.md and are not locked yet. |
| 2026-10-30 | three + @react-three/fiber installed; drei and gsap deferred | R3F is named in the docs and suits component-scoped scenes with automatic disposal on unmount. Drei and GSAP are added only when a scene needs them. |
| 2026-10-30 | `cacheComponents` left on (create-next-app 16 default) | This is the framework default. Revisit if it conflicts with CMS preview. |
| 2026-10-30 | Global `robots: noindex` | Staging and local builds must not be indexed (CLOUD.md). Lift this only for the approved production launch. |
| 2026-10-30 | No fonts loaded | Typography stays unlocked until the moodboard is approved (DESIGN.md). |
| 2026-10-30 | Project lives in `RayMindSet-Website/raymindset-web`, with no git repository | Owner instruction: no GitHub, no commits, `ray-website` repository untouched. |

## Open decisions (need owner)
- Concept route: A Mind Museum / B Infinite Atlas / C Unfinished Monument, or a new direction based on real footage.
- CMS: Sanity or Payload.
- Display and body typefaces (licensed).
- Canonical host: www or apex.
- Test runner (Vitest + Playwright proposed for Sprint 1).

## 2026-10-30 — Homepage direction (after four rejected versions)
| Decision | Reason |
|---|---|
| Homepage = real eye portal → full 3D scroll world → eye returns at Connect | Owner asked for a full 3D scroll experience where the content is the highlight. |
| Chapter headlines are extruded 3D type (Archivo SemiExpanded Bold, converted offline to `public/assets/fonts/*.typeface.json`); body copy is SDF text via `troika-three-text` | The words are the hero. troika is the only added runtime dependency; the font conversion used opentype.js in a scratch folder, not in the project. |
| Real photographs/footage from Wikimedia Commons as stand-ins, credited in the footer and `public/assets/found/credits.json` | Owner: everything must be real; Ray's own archive not yet supplied. |
| Removed: Poly Haven object room, first-person vision shader, `lenis` kept | Rejected directions; their assets were deleted to keep the bundle lean. |
| `?snap` query skips scroll easing | QA screenshots only (software GPU renders too slowly for the easing to settle). |

## 2026-10-30 — No images (owner)
| Decision | Reason |
|---|---|
| Every chapter is a real photoscanned 3D object (Poly Haven, CC0) instead of a photograph; the eye photo is replaced by a scanned marble bust | Owner: "no images, fully real 3D". All Wikimedia photos and footage were deleted. |
| Bloom (three EffectComposer), light shafts and dust motes in the beams, mirror floor on desktop | The "magic" the owner asked for, kept physically plausible. Phones skip bloom and the mirror for performance. |

## 2026-10-30 — Fresh start (owner)
All homepage code, 3D scenes, content draft, downloaded models, fonts, HDRIs and photos were removed, along with the `lenis` and `troika-three-text` packages. The project is back to the setup scaffold (Next.js JS, Tailwind, three, @react-three/fiber, docs, content schema). The rows above about the eye, room, vision and 3D-word directions are history only. The next homepage follows the owner's own idea.

## 2026-10-30 — Owner-referenced opening and world
| Decision | Reason |
|---|---|
| Opening = loading dial on an endless 3D floor → "Click to enter" → column of light (structure referenced from bruno-simon.com, own visual design) | Owner pointed to bruno-simon.com for the start. Not copied: own floor, dial, colours and entrance. |
| After entering = one 3D world driven by page scroll: iridescent chrome Möbius hero, scramble headline, glass chapter screens with RGB-split titles, bokeh particles, bloom + scroll-speed chromatic aberration + grain (structure referenced from activetheory.net V6, own design) | Owner pointed to activetheory.net for after the click. Own object (Möbius), copy, palette and font (Martian Mono). |
| Dependencies re-added: `lenis` (smooth scroll), `troika-three-text` (crisp text on the 3D screens) | Needed for smooth scroll and readable 3D text. |
| Glass pill nav, monospace caps, glitch text | Taken from the owner's reference; these override the Taste Skill house bans on glass/mono/tracked caps because the brief wins. |

## 2026-10-30 — Warm compass section (owner reference: oryzo.ai)
| Decision | Reason |
|---|---|
| After the chapter carousel the world warms into an umber room with a thin rainbow edge glow; a real photoscanned brass compass (Poly Haven `seadogs_compass`, CC0) carries the section: blur-in "Built from curiosity.*", lid opens on scroll, needle follows the cursor, ghost RAYMINDSET wordmark, horizontal cards for the six content pillars | Owner asked for the part after the AT-style world to follow oryzo.ai: one real hero object through the scroll, blur-in sans headlines, ghost wordmark, horizontal cards. Own object, copy and colours. |
| Hanken Grotesk added (next/font) for this section only | Oryzo-style clean grotesk headlines; the first world keeps Martian Mono. |

## 2026-10-30 — Order and welcome (owner)
The site now runs: loading dial → Click to enter → "WELCOME TO / RAYMINDSET" lands letter by letter in the column of light, a warm light floods the screen → the compass room (oryzo-style) → six pillar cards (end). The teal headline, chrome ring, chapter carousel and contact section were removed at the owner's request, with their code and fonts. `troika-three-text` removed.
