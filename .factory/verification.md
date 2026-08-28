# Verification report — PASS

- Work order: `motion-curve-playground-verify-1`
- Candidate: `7b4c96325bc59c84e1f2d334be89688ca333bcc8`
- Verified URL: <https://motion-curve-playground.sociobot.in/>
- Date: 2026-08-28
- Scope: independent QA of the static web product. No product code was changed.

## Verdict

**PASS.** The deployed site is the tested candidate, and the required motion-curve workflow works on desktop and at a 390px mobile viewport. The local build and all repository tests pass. One Minor response-policy hardening issue is recorded below; it does not prevent this free, local-first static utility from meeting its acceptance contract.

## Build and automated checks

Fresh clean checkout at the candidate SHA:

| Check | Evidence | Result |
| --- | --- | --- |
| Install | `npm ci` | Passed; 60 packages installed |
| Dependency audit | `npm audit --omit=dev` | 0 vulnerabilities |
| Unit tests | `npm test` | 5/5 passed (`src/curve.test.ts`) |
| Type check + exact production build | `npm run build` (`tsc --noEmit && vite build`) | Passed; produced `dist/` |
| Browser integration suite | `npm run test:e2e` | 16/16 Chromium desktop/mobile tests passed; Playwright `test-results/.last-run.json` reports `passed` |
| Lint | No separate lint command is declared in `package.json` | N/A |

Production output is within the static-product budget: JavaScript 19,495 B (6,830 B gzip), CSS 17,924 B (4,674 B gzip), 720px hero WebP 9,122 B, and 1200px hero WebP 19,196 B. No fonts are downloaded.

## Independent product exercise

Against the live candidate I verified:

- All six descriptive intent presets select and replace both curves.
- Position/rotation editing, including range boundaries `x=0/1` and `y=-0.5/1.5`; the generated curve readout reflected the boundary values.
- Keyboard-only tab traversal through the skip link, navigation, presets, preview controls, tabs, SVG handles, range controls, export controls, and footer links. Arrow keys changed a focused SVG handle; its designed Signal focus stroke computed as `rgb(114, 241, 184)`.
- Simultaneous 2-, 4-, and 8-frame comparison strips, JavaScript export, clipboard copy feedback, share-link copy, and `motion-feel.js` download.
- Invalid share fragment recovery: the live app announced the damaged link, restored the default curve, and removed the bad hash. Corrupt `localStorage` recovery also announced the issue and restored a usable default.
- Reduced-motion behavior: Play immediately presented `t 1.00` plus the explanatory status, rather than continuous animation.
- At 390px: no horizontal overflow (`scrollWidth=390`, `clientWidth=390`); all measured buttons/selects/ranges were at least 44px in both dimensions. The 320px reflow check also had no horizontal overflow.
- Visual review of live desktop and 390px screenshots: the Signal Garden visual system, original hero art, curve editor, sampled strips, and export panel are legible and stack intentionally on mobile.

Accessibility checks found 0 serious/critical axe findings in independent desktop and mobile scans (also covered by the 16 passing Playwright tests). The page has a title, `lang="en"`, one `h1`, skip link, `main`, labelled controls, and visible focus. Browser probes recorded no console errors or page errors.

## Live deployment, privacy, PWA, and policies

Deployment parity is exact. SHA-256 matched the locally built and live `index.html`, main JS, CSS, both hero images, service worker, and both legal pages. The live root was HTTP 200 with the same 4,651-byte HTML and the same hashed asset references as `dist/`.

- Runtime request capture recorded **no outbound requests** on app load; static inspection found no third-party runtime scripts, fonts, analytics, or APIs. The only external URL is the user-activated Sociobot footer link.
- Curve data is stored only under localStorage key `motion-feel-lab:v1`; share data is in the URL fragment. `/privacy/` accurately discloses both local storage and standard host logging, and `/terms/` is present.
- The live service worker was active at the site scope; `registration.update()` completed, and a cached shell reloaded successfully after the context was set offline. The offline status appeared and the lab remained usable.
- Live headers include HTTPS/HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive camera/microphone/geolocation Permissions-Policy. Hashed assets are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.

Mobile Lighthouse 13.4.1, using the supplied Playwright Chromium and simulated throttling, produced Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.1s, LCP 1.2s, TBT 80ms, CLS 0.041, and 24 KiB total transfer. Lighthouse emitted a post-collection `TARGET_CRASHED` while taking its full-page screenshot and therefore exited non-zero, but its completed audit JSON contains the above scores and metrics; direct Playwright visual/error checks passed.

## Defects by severity

### Blocker / Critical / Major

None.

### Minor

1. **Security response hardening:** the live response has no `Content-Security-Policy` and no `X-Frame-Options` or CSP `frame-ancestors`; its HSTS `max-age=10886400` is shorter than the customary one-year recommendation. This is not a functional, privacy, or accessibility failure for the current local-first static app, but a future change should add a self-only CSP with an explicit `frame-ancestors` policy and raise HSTS duration where hosting permits.

### Informational

Lighthouse's Chrome target crashed only after collecting the audit artifacts; this is a verifier-browser instability, not a reproducible product console/page error. Preserve the direct Playwright and completed Lighthouse metrics as the release evidence.

## Re-run

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Then compare the built asset hashes with the live URL and repeat the live Playwright checks described above.
