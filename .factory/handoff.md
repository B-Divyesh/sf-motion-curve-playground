# Motion Feel Lab — verification handoff: PASS

## Independent release verification

- Work order: `motion-curve-playground-verify-1`
- Candidate tested: `7b4c96325bc59c84e1f2d334be89688ca333bcc8`
- Live URL verified: <https://motion-curve-playground.sociobot.in/>
- Result: **PASS** — fresh `npm ci`, unit tests (5/5), exact type-check/production build, and Playwright integration tests (16/16) passed. The live HTML, JS, CSS, responsive images, service worker, and legal pages hash-match the candidate build.
- Independent live coverage passed: six presets; curve boundaries; keyboard/focus; CSS/JS export, copy, share, and download; malformed share/local-state recovery; 390px mobile targets/overflow; reduced motion; axe serious/critical (0); no browser console/page errors; service-worker update registration and offline reload.
- Performance: mobile Lighthouse recorded 99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO (FCP 1.1s, LCP 1.2s, TBT 80ms, CLS 0.041, 24 KiB transfer). The Lighthouse Chrome tab crashed only after audit data collection; direct browser verification passed.
- Known defect, Minor: live security response hardening is incomplete (no CSP or clickjacking policy; HSTS is 126 days). This is non-blocking for the accepted static product; add a self-only CSP with `frame-ancestors` and increase HSTS where host policy allows.

Full evidence and exact commands are in [`.factory/verification.md`](verification.md).

---

# Original build handoff

- Work order: `motion-curve-playground-build-1`
- Completed: 2026-08-28
- Artifact: static Vite + TypeScript site, output in `dist/`

## What shipped

- A finished, local-first motion curve instrument with six descriptive starting intents.
- Independently editable position and rotation cubic-bezier curves: direct pointer handles, 44px handle hit areas, keyboard arrows, and four labeled range inputs.
- Frame-rate-independent preview driven by elapsed time, not rendered-frame increments.
- Static onion-skin path and simultaneous 2-, 4-, and 8-frame comparison strips.
- Duration choices, reset, local persistence, validated URL-fragment share links, CSS export, JavaScript sampler export, clipboard feedback, and file download.
- Explicit reduced-motion behavior: autoplay is replaced by an immediate end-state while static samples remain available.
- Offline shell and status messaging, including precaching of Vite’s hashed production assets.
- Responsive desktop and 390px mobile layouts with a product-specific pixel/demoscene visual system.
- Original generated `signal-garden` illustration, source/prompt/review provenance, and 720/1200px WebP derivatives (9 KB and 19 KB).
- Static privacy and terms pages, manifest, icon, sitemap, robots file, and Azure Static Web Apps routing/security/cache configuration.

## Run and verify

```sh
npm ci
npm run check
```

`npm run check` runs unit tests, TypeScript + production build, and Playwright desktop/mobile tests. The exact deploy build command is:

```sh
npm run build
```

It produces `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html`.

## Verification results

- `npm test`: **5/5 passed** — bezier solving, endpoint/overshoot behavior, formatting, and imported-value validation.
- `npm run test:e2e`: **16/16 passed** across Chromium desktop and a 390px mobile viewport.
- Playwright coverage: complete preset/edit/compare/export path, keyboard handles, no horizontal overflow, no console errors, offline reload, reduced-motion fallback, and legal routes.
- axe-core in both viewports: **0 serious or critical violations**.
- `npm audit`: **0 vulnerabilities**.
- Production bundles: **19.50 KB JS**, **17.92 KB CSS** uncompressed; no runtime font, script, or analytics dependency.
- Mobile Lighthouse 12.8.2 against the production preview: **Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100**.
- Lighthouse lab metrics: **FCP 0.9 s, LCP 0.9 s, TBT 10 ms, CLS 0, Speed Index 0.9 s**, 23 KB transferred in the audit.
- Manual visual review completed at 1440px and 390px. Hero assets are 19 KB desktop and 9 KB mobile, both below the 300 KB budget.

## Privacy and operational notes

- No account, tracking, advertising, third-party runtime CDN, or external API request.
- The current curve is stored only in `localStorage`. Share links encode curve values in the URL fragment, which browsers do not send to the server.
- Hosting may retain standard request logs; this is disclosed on `/privacy/`.
- Service worker cache version is `motion-feel-lab-v2`; bump it when changing offline caching behavior.

## Known gaps and next steps

- Cross-browser automation is limited to Chromium because the work order supplied Chromium 1.58.2. The app uses standard DOM/SVG APIs and has no known browser-specific defects.
- Emotional interpretation is intentionally not scored or claimed. Real-world creators should validate presets with their own object, scale, sound, and context.
- A future evidence-driven iteration could add named A/B curve slots. V1 compares the same authored move across the brief’s required 2/4/8-frame resolutions.
