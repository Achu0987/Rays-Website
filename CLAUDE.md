@AGENTS.md

# RayMindset — project instructions for Claude Code

The full original directive is [docs/CLAUDE_ORIGINAL.md](docs/CLAUDE_ORIGINAL.md). Read it and every file in /docs before implementing anything. The overrides below take precedence over it.

## Owner overrides (2026-10-30)
- **JavaScript only.** Use `.js` / `.jsx` (and `.mjs` for config). Never create `.ts` or `.tsx` files. This replaces the original "TypeScript strict" default. Content shapes are documented with JSDoc in `src/lib/content/schemas.js`; `src/types` from the original layout is not used.
- **3D:** Three.js + React Three Fiber. Drei and GSAP are added only when a specific scene needs them (record why in docs/DECISIONS.md).
- **Repository:** github.com/Achu0987/Rays-Website (main). No deploys until the owner says so.
- **Realism:** the owner rejected stylized/procedural 3D concepts. Agree on references and real assets before building any scene.

## Work protocol (from the original)
1. Do not overwrite existing code or assets without review.
2. Keep docs/IMPLEMENTATION_PLAN.md current. Log decisions in docs/DECISIONS.md and QA results in docs/QA_REPORT.md.
3. Ask before design-direction changes, destructive commands, paid services, or deployment.
4. Never invent biography. Unapproved copy must be visibly labelled with a verification status.
5. After each milestone, run `npm run lint` and `npm run build`, plus accessibility and performance checks.

## Layout
src/app (routes) · src/components/{ui,layout,scenes,story} · src/lib/{content,seo,analytics} · src/styles · public/assets/{images,video,models,textures} · docs · tests
