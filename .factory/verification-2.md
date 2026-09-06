# Edit motion curves for animation — verification 2

Date: 2026-09-06  
Live URL: <https://motion-curve-playground.sociobot.in>  
Implementation reviewed: `fe17b8b0628e30a140d25f217270b9663174e490`  
Documentation and test revision reviewed: `af4bcb3f8e98c7090bf4be777ca0d8234b4c7f4b`  
Work order: `motion-curve-playground-verify-2`

## Verdict

**FAIL — 1 Minor finding and 0 untested claims.**

The main curve workflow and all 17 declared claims pass. The live build matches the implementation candidate. Acceptance still fails because one phone touch target remains below the required 44 by 44 CSS pixels.

Finding count: 1. Severity count: 0 Blocker, 0 Critical, 0 Major, 1 Minor. Untested claim count: 0.

## First screen before scrolling

- Job: **Edit motion curves for animation**.
- Audience: indie animators and game or UI makers who need timing to read at a few frames.
- First action: **Try it with sample data**. It says this loads Elastic echo at 1,200 ms.
- The action ended at 686.84 px in a 900 px desktop viewport and 397.16 px in an 844 px phone viewport.
- Price, browser-storage privacy, and offline use appear as three separate facts before scrolling.

Fresh screenshots: `/work/.evidence/verify-2/desktop-first-screen.png` and `/work/.evidence/verify-2/phone-first-screen.png`.

## Finding

### Minor 1 — The phone footer Terms link is narrower than 44 pixels

At a fresh 390 by 844 phone viewport, the visible **Terms** link measured 38.30 by 44 CSS pixels. The attached accessibility and site-structure contracts require every touch target to be at least 44 by 44 pixels.

This is the remaining part of Review 1 Minor 6. The graph handles now measure at least 44 by 44 pixels, but the footer link still has only a minimum height. Add enough horizontal target area to make the link at least 44 pixels wide without reducing the gap between adjacent controls.

Evidence: `/work/.evidence/verify-2/live-browser.json`, under `touchTargets`.

## Clean checkout and declared claims

A new clone at documentation revision `af4bcb3` was used. Node was `v22.23.2` and npm was `10.9.8`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; documented prerequisites installed |
| `npm audit --omit=dev` | Passed; 0 production vulnerabilities |
| `npm run check` | Passed; 5 unit and 25 Chromium checks |
| `npm run build` | Passed as part of the checks; `dist/` produced |

The build produced 20,745 bytes of JavaScript, 20,040 bytes of CSS, a 9,122-byte phone hero image, and a 19,196-byte desktop hero image. These are below the static-product budgets. A full dependency audit reports four development-only findings in the Azure Static Web Apps emulator dependency; no Node dependency ships in the static runtime.

Every command in `.factory/claims.json` was run separately. Each selected exactly one matching claim test and exited 0.

| Claim | Result |
| --- | --- |
| `sample-demo` | Pass |
| `demo-isolation` | Pass |
| `local-persistence` | Pass |
| `six-presets` | Pass |
| `curve-editing` | Pass |
| `frame-comparison` | Pass |
| `css-export` | Pass |
| `javascript-export` | Pass |
| `file-download` | Pass |
| `share-link` | Pass |
| `share-fragment` | Pass |
| `offline-reload` | Pass |
| `reduced-motion` | Pass |
| `small-screen` | Pass |
| `free-price` | Pass |
| `no-account` | Pass |
| `local-privacy` | Pass |

The manifest has 17 entries, the test source has 17 unique matching tags, and there are no extra or missing tags. Landing, editor, README, privacy, and terms copy were cross-checked against the manifest. No untested product claim remains.

Command evidence: `/work/.evidence/verify-2/clean-npm-run-check.log`, `/work/.evidence/verify-2/claim-commands.log`, and `/work/.evidence/verify-2/claim-command-results.tsv`.

## Live product exercise

Fresh desktop and phone browser contexts both completed this path:

1. Open the first screen with empty site storage.
2. Choose **Try it with sample data**.
3. Confirm the persistent **Demo — sample data, nothing is saved** label.
4. Confirm Elastic echo, 1,200 ms, seven onion samples, 2/4/8-frame strips, and populated CSS output.
5. Change to Even glide and 1,800 ms.
6. Confirm only `demo:motion-feel-lab:v1` changes while seeded normal data stays unchanged.
7. Use **Reset demo** and confirm Elastic echo at 1,200 ms returns.
8. Use **Start for real** and confirm the demo key is removed while the seeded normal curve still loads.

Normal and boundary paths passed. Rotation values `0`, `-0.5`, `1`, and `1.5` appeared in the curve readout. Keyboard arrows changed a focused graph handle and moved between curve tabs. CSS and JavaScript output, clipboard copy, share fragments, and file download completed.

Recovery paths passed. A damaged share fragment and corrupt demo storage each showed a plain error, removed or ignored the invalid value, and restored a usable Elastic echo sample. Normal curve persistence and **Reset curve** also passed in the declared claim command.

The full live demo flow made three requests: `/demo` and its same-origin JavaScript and CSS. Selecting, playing, copying code, copying a share link, downloading, and resetting made no external request.

## Accessibility, mobile, and motion

- Live axe scans on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 found 0 serious or critical violations.
- Each route has `lang="en"`, one `h1`, a `main`, a header, navigation, a footer, and route-specific title.
- The skip link is the first keyboard target, becomes visible with the mint focus ring, and moves to `#main`.
- Custom graph handles expose slider names and values. Arrow keys change them.
- Reduced-motion mode shows `t 1.00` and the end-state message without continuous playback.
- Desktop and 390 px phone layouts have no horizontal overflow.
- No console or page error appeared on any 200 route. The browser reports the expected failed-document status for the deliberate HTTP 404; the 404 page itself renders and passes axe.
- The single dark treatment is documented in `.factory/design.md`; live axe found no serious or critical contrast issue.

The only failed accessibility check is the 38.30 px-wide Terms target recorded above.

## Routes, privacy, offline use, and performance

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 with their correct titles.
- An unknown route returns HTTP 404, renders `Page not found — Motion Feel Lab`, and offers working links home and to the demo.
- All crawled internal links and static route assets return 200. `mailto:` links were not opened.
- Live headers include a self-only CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy, and one-year HSTS.
- A fresh service worker registered, completed `update()`, controlled the demo, and reloaded it offline with the editor enabled and offline status visible.
- Lighthouse mobile performance is 99. FCP is 1.53 s, LCP is 1.54 s, TBT is 88.85 ms, CLS is 0, and transfer is 26,162 bytes.

This is a static web product. Backend tenant isolation, restart persistence, health, 429 handling, SQLite, CLI installation, library consumption, and desktop packaging are not applicable. The brief does not benefit from an AI step; the required editing, comparison, sharing, and export paths are present.

## Candidate and live parity

Commits after implementation `fe17b8b` change only `.factory/claims.json`, `.factory/handoff.md`, and `tests/claims.spec.ts`. They do not require a new product image.

The live root, demo, privacy, terms, designed unknown-route 404 body, hashed JavaScript, hashed CSS, and service worker match the clean local build byte for byte. Response-header behavior matches `staticwebapp.config.json`.

Parity evidence: `/work/.evidence/verify-2/live-parity-public.json`.

## Earlier finding disposition

| Earlier item | Current disposition |
| --- | --- |
| Review 1 Major 1: no isolated demo | Resolved; both fresh viewports proved separate demo storage, reset, exit, and unchanged normal data |
| Review 1 Major 2: no claims contract | Resolved; 17 of 17 declared commands pass, with one tag each and 0 untested claims |
| Review 1 Major 3: first screen unclear | Resolved; job, audience, action, and three facts are visible before scrolling |
| Review 1 Major 4: no real 404 | Resolved; unknown URL returns 404 with the designed recovery page |
| Review 1 Minor 5: route structure and metadata | Resolved; route titles, navigation, footer, social metadata, sitemap, and demo URL are present |
| Review 1 Minor 6: undersized handles and Terms link | **Partly open; handles pass, Terms is 38.30 by 44 px. See Minor 1.** |
| Review 1 Minor 7 and verification 1 Minor: response headers | Resolved; CSP, clickjacking policy, and one-year HSTS are live |
| Earlier Lighthouse post-audit crash | Not reproduced; Lighthouse completed and wrote valid JSON |

## Evidence

- `/work/.evidence/verify-2/live-browser.json`
- `/work/.evidence/verify-2/live-browser.log`
- `/work/.evidence/verify-2/live-demo-exit.json`
- `/work/.evidence/verify-2/lighthouse-live.json`
- `/work/.evidence/verify-2/lighthouse-summary.json`
- `/work/.evidence/verify-2/live-parity-public.json`
- `/work/.evidence/verify-2/desktop-first-screen.png`
- `/work/.evidence/verify-2/phone-first-screen.png`
- `/work/.evidence/verify-2/desktop-demo-populated.png`
- `/work/.evidence/verify-2/phone-demo-populated.png`

No product code was changed during this verification.
