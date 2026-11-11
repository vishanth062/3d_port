# Vishanth Portfolio

Premium space-themed professional portfolio built with React, strict TypeScript, Vite, Three.js, and React Three Fiber.

Live site target: [https://protfolio-zs97.onrender.com](https://protfolio-zs97.onrender.com)

## Technology stack

- React 18 + TypeScript (strict)
- Vite 5
- Three.js + React Three Fiber + Drei
- GSAP (ScrollTrigger) for section reveals
- CSS Modules + design tokens
- ESLint + Prettier

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command                | Purpose                             |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Local development server            |
| `npm run build`        | Typecheck + production build        |
| `npm run preview`      | Preview production build            |
| `npm run lint`         | ESLint                              |
| `npm run typecheck`    | TypeScript project references check |
| `npm run format`       | Prettier write                      |
| `npm run format:check` | Prettier check                      |

## Folder structure

```text
src/
  app/           App shell + site config
  components/    Reusable UI, layout, navigation, animations
  sections/      Page sections (Hero, About, Experience, ...)
  three/         R3F scenes, objects, performance helpers
  data/          Typed portfolio content (source of truth for copy)
  hooks/         Shared React hooks
  styles/        Global tokens, typography, motion
  types/         Shared TypeScript models
public/
  resume/        Downloadable résumé PDF
  textures/      Optional atmospheric assets
```

## Content updates

- Profile / socials / about: `src/data/profile.ts`
- Experience: `src/data/experience.ts`
- Projects: `src/data/projects.ts`
- Skills: `src/data/skills.ts`
- Education / certifications: `src/data/education.ts`
- Early foundations: `src/data/foundations.ts`
- Resume file: replace `public/resume/Vishanth_Resume.pdf`

## Three.js architecture

- `ThreeScene` lazily loads the WebGL canvas and falls back when WebGL is unavailable.
- `UniverseScene` owns lights, fog, and composition.
- `Starfield` uses a single Points system with adaptive particle counts.
- `OrbitalCore` provides a lightweight central celestial motif with subtle pointer parallax.
- Heavy GLTF models are intentionally omitted for performance (Atelier-inspired lightweight 3D).

## Deployment

This app lives in `vite-project/` (same folder as the previous vanilla site) so Render / GitHub Pages redeploys stay simple:

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- `render.yaml` is included for static hosting

## Accessibility & motion

- Skip link, semantic landmarks, focus-visible styles
- `prefers-reduced-motion` disables GSAP reveals and reduces 3D motion
- Content remains readable without WebGL
