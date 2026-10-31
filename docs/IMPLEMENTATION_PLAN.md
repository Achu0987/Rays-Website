# Implementation plan

Status: **Setup complete. Waiting for owner approval before Sprint 0 design work.**

## Sprint 0 — Discovery and direction (gate: Ray chooses a concept)
- [ ] Agree 3–5 reference sites and define what "real" means: real footage and photos, or photoreal scanned 3D.
- [ ] Collect real assets: portrait set, boxing clips, travel archive, book cover and metadata, Socialsect verified profile.
- [ ] Founder interview, then a 12–20 item milestone timeline marked with verification status.
- [ ] Moodboards and concept routes, each with hero stills (desktop and mobile), a 15–30s motion prototype, tokens, a fallback, and a complexity estimate.
- [ ] Choose the CMS (Sanity or Payload), the typefaces, and the canonical domain.
- Risk: building before assets exist. Three stylized concepts were already rejected.

## Sprint 1 — Vertical slice (gate: interaction quality and performance)
- [ ] Header and navigation shell, skip link, footer.
- [ ] Portal hero: HTML text first, one lazy-loaded R3F canvas, Enter/Skip controls, static image fallback, reduced-motion variant, WebGL detection.
- [ ] Two representative sections (Identity, Connect).
- [ ] Local content fixtures matching `src/lib/content/schemas.js`, plus the adapter interface.
- [ ] Vitest for content logic and Playwright for smoke and accessibility tests.
- [ ] Measure LCP, INP and CLS on a real phone and on desktop.

## Sprint 2 — Design system and core pages (gate: full site works without WebGL)
/story, /ventures, /ventures/[slug] (real ventures only), /journal, /journal/[slug], /experiences, /media, /connect, /privacy, 404, sitemap.xml, robots.txt. CMS schemas, and seed content labelled with verification status.

## Sprint 3 — Signature storytelling
Journey timeline, ventures constellation, and one boxing or travel scene, each with responsive and reduced-motion variants.

## Sprint 4 — Content, SEO, instrumentation
Approved copy and media, OG images, structured data (factual only), analytics events (hero_enter, intro_skip, story_chapter_view, venture_open, article_open, social_click, contact_submit), consent, contact pipeline.

## Sprint 5 — Hardening and launch
Testing matrix from DEVELOPER_DIRECTIVE.md, Lighthouse and Web Vitals, keyboard and screen-reader audit, broken-link scan, rollback rehearsal. Ray approves the deployment.

## Acceptance gates (every sprint)
Touch, mouse and keyboard all work. Reduced motion is respected. All content is readable without WebGL. No horizontal overflow. WCAG AA contrast. Logical headings. No console errors. No unapproved claims.
