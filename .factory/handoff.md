# Motion Feel Lab — repair 1 handoff: PASS

## Repair release — 2026-09-06

- Work order: `motion-curve-playground-repair-1`
- Implementation and deployed artifact SHA: `fe17b8b0628e30a140d25f217270b9663174e490`
- Documentation baseline SHA: `fe17b8b0628e30a140d25f217270b9663174e490`
- Live URL: <https://motion-curve-playground.sociobot.in>
- Product class: static web; no backend, billing offer, account, or external integration.
- Result: **PASS** — all seven review findings are resolved and every documented public claim has a demo-sandbox check.

### What changed

- Added a direct `/demo` page with an Elastic echo sample at 1,200 ms, a persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**.
- Demo state uses `demo:motion-feel-lab:v1`; normal state uses `motion-feel-lab:v1`. The demo never reads or writes normal state.
- Rewrote the first screen in plain words. It now states the job, audience, visible sample action, and separate price/privacy/offline facts before scrolling at 390px and desktop sizes.
- Added `.factory/claims.json`, `.factory/demo.md`, `.factory/copy-audit.md`, and 16 tagged browser claim checks. Claims use the real demo route and observable outcomes.
- Added a standalone `/demo` document, route-specific metadata, social image, Apple touch icon, sitemap entry, consistent header/footer, legal navigation, and a product-specific 404 document.
- Replaced fallback-to-home unknown routes with a deliberate HTTP 404 response. Added self-only CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, and one-year HSTS configuration.
- Increased graph-handle hit areas and kept Privacy available in the compact mobile header.

### Verification

Clean setup and local checks:

```sh
npm ci
npm audit --omit=dev
npm run check
```

- `npm audit --omit=dev`: 0 production vulnerabilities.
- `npm run check`: 5 Vitest unit checks and 24 Playwright checks passed.
- Each of the 16 commands in `.factory/claims.json` was run separately; all passed. The final full suite exercises all 16 again.
- Production build: 20.75 KB JS (7.22 KB gzip) and 20.04 KB CSS (5.04 KB gzip). The initial app assets remain below the static-product budgets.
- Static Web Apps emulator: `/demo` is HTTP 200 and an unknown path is HTTP 404 with the designed page. The configured CSP, clickjacking policy, and cache policy were observed as response headers.
- Worker URL verifier passed locally and on HTTPS. It found zero console/page errors, one `h1`, `lang="en"`, a `main` landmark, complete image alt attributes, and labelled buttons.

Live checks on the deployed implementation:

- `GET /`: 200, title `Motion Feel Lab — Edit motion curves`; live HTML SHA-256 matches `dist/index.html`.
- `GET /demo`: 200, title `Demo — Motion Feel Lab`.
- `GET /definitely-missing-review-1`: 404, title `Page not found — Motion Feel Lab`.
- Fresh desktop (1366 × 900) and phone (390 × 844) contexts showed the job, audience, and **Try it with sample data** action before scrolling. The action ended at 687px desktop and 397px phone.
- In both fresh contexts, the sample loaded with the persistent banner, 1,200 ms duration, and Elastic echo selected. Changing it, resetting it, and checking a pre-seeded normal curve proved normal storage was unchanged. No console errors appeared.
- Live axe scans of `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 page found 0 serious/critical violations.
- HTTPS responses now contain CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy, and HSTS `max-age=31536000; includeSubDomains`.

Evidence is under `/work/.evidence/verify-local/` and `/work/.evidence/verify-live/`.

### Known gaps and next steps

- No product defects are known. Browser automation covers Chromium; the UI uses standard browser APIs, but Safari and Firefox are not separately automated in this worker image.
- The product is intentionally free. There is no paid offer or billing-registration dependency.

---

# Archived review and verification history

## Review 1 — 2026-09-05

- Work order: `motion-curve-playground-review-1`
- Implementation reviewed: `7b4c96325bc59c84e1f2d334be89688ca333bcc8`
- Documentation reviewed: `3f3b178654e0175c032a4158e0d297c0bc67d114`
- Live URL: <https://motion-curve-playground.sociobot.in>
- Result: **FAIL — 7 findings and 18 untested public claims.**
- Product code was not changed.

The core curve workflow, clean build, 5 unit tests, 16 browser tests, live desktop/phone behavior, offline reload, reduced motion, exports, recovery, same-origin privacy capture, axe checks, and Lighthouse budgets passed. Local and live asset hashes match.

Required work remains: build the isolated one-click sample mode; add the claims manifest and one tagged test per public claim; replace the first-screen metaphor with the job, audience, visible sample action, and three facts; add a real 404; complete route metadata and shared header/footer structure; enlarge the remaining small touch targets; and add CSP/clickjacking response headers. Add `.factory/demo.md` and `.factory/copy-audit.md` with that repair.

Run the current gates with:

```sh
npm ci
npm run check
```

Full evidence and exact finding details are in [`.factory/review-1.md`](review-1.md).

---

# Previous verification handoff: PASS

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
