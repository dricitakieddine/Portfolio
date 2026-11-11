# Portfolio Build Plan

## File structure
```
PORTFOLIO/
├── index.html              # Single-page site, semantic sections
├── style.css               # All styles (black/red/white palette, GSAP-agnostic)
├── script.js               # Vanilla JS: intro, cursor, nav, scroll reveal, tilt, toast, mailto
├── assets/
│   ├── photo.png           # your logo + favicon + hero portrait (REQUIRED, add yourself)
│   └── Takieddine_Drici_CV.pdf   # CV download (REQUIRED, add yourself)
├── .gitignore
├── README.md               # preview link + how to edit
├── .github/
│   └── workflows/
│       └── pages.yml       # GitHub Pages deploy on push to main
└── PLAN.md                 # this file
```

## Design decisions
- Palette: `#0A0A0A` bg, `#E10600` red accent, `#F5F5F5` / `#9A9A9A` text only
- Fonts: Space Grotesk (headings) + Inter (body) from Google Fonts
- Logo `TAKI` next to circular photo.png with thin red ring
- Dark-only theme, no toggle
- No build step; GSAP + ScrollTrigger from CDN (with CSS/IntersectionObserver fallback-safe code)

## Sections
Hero → About (counters) → Skills (grouped chips) → Experience (scroll-draw timeline) → Projects (grid, placeholder thumbs) → Certifications & Education → CV (web version + PDF download) → Contact (mailto form + copy-email toast) → Footer

## Animations
Black intro screen → logo scales in + red ring draws → fade into site; scroll reveal per section; custom cursor; magnetic buttons; parally hero glow; red scroll-progress bar; respects `prefers-reduced-motion`.

## GitHub Pages
`git init`, `.gitignore`, `README.md`, `.github/workflows/pages.yml`, then push to `main` and enable Pages in repo settings. Live at `https://<username>.github.io/<repo>/`.

## Notes
- `assets/photo.png` and `assets/Takieddine_Drici_CV.pdf` do not exist yet — you must add them. The site references them but won't break if missing (broken image alt text + PDF link still present).
- All copy is from your brief; nothing invented.