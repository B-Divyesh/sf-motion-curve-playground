# Edit and compare motion curves — review 1

Date: 2026-09-05  
Live URL: <https://motion-curve-playground.sociobot.in>  
Implementation reviewed: `7b4c96325bc59c84e1f2d334be89688ca333bcc8`  
Documentation reviewed: `3f3b178654e0175c032a4158e0d297c0bc67d114`

## Verdict

**FAIL — 7 findings and 18 untested public claims.**

The editor works, but the required sample sandbox does not exist. The claims manifest is also missing. A PASS requires zero findings and zero untested claims.

Severity count: 0 Blocker, 0 Critical, 4 Major, 3 Minor.

## First screen before scrolling

- Job shown: start with a motion quality, edit position and rotation curves, and inspect 2-, 4-, and 8-frame samples.
- Intended audience: indie animators and game or UI makers. The first screen does not name them.
- First action: the desktop page offers **Open the lab**. The phone header first offers **Lab**. The main **Open the lab** button starts at 806.7 px and ends at 852.7 px in an 844 px viewport, so it is partly cut off before scrolling.
- The required **Try it with sample data** action is absent.

The visible heading is “Shape the pause. See the feel.” It does not name the job and uses metaphor. “Timing instrument 01,” “Signal garden,” “Take it with you,” and “From adjective to evidence” also break the plain-words contract.

## Findings

### Major 1 — The required sample sandbox is absent and `/demo` changes the normal storage key

There is no **Try it with sample data** action on the first screen. `/demo` returns the normal app with the normal title. It has no persistent sample label, **Reset demo**, or **Start for real** controls. `.factory/demo.md` is missing.

In a fresh phone context, I set the normal `motion-feel-lab:v1` key to a saved 1,800 ms curve, then opened `/demo`. The page loaded that 1,800 ms value. Selecting **Elastic echo** changed the same key. The route is therefore neither isolated nor non-persistent.

Expected: one-click realistic sample data, a persistent “Demo — sample data, nothing is saved” label, separate `demo:` storage, reset, and a safe exit to normal use.

### Major 2 — The claims manifest is missing and 18 public claims have no contract tests

`.factory/claims.json` does not exist. There are no `@claim:<id>` tests. No claim command could be run because no claim command is declared. The generic unit and browser tests pass, but they do not map each public promise to exactly one sandbox test.

The public claim inventory is:

| # | Claim in the site or README | Contract test status |
| --- | --- | --- |
| 1 | Six motion intent presets | Missing |
| 2 | Position and rotation curves can be edited by drag, keyboard, and range controls | Missing |
| 3 | Preview timing is frame-rate independent | Missing |
| 4 | The preview includes a static onion path | Missing |
| 5 | The same move is shown at 2, 4, and 8 frames | Missing |
| 6 | CSS export works | Missing |
| 7 | JavaScript export is deterministic | Missing |
| 8 | Export downloads a file | Missing |
| 9 | A curve can be shared by URL | Missing |
| 10 | The latest curve persists locally | Missing |
| 11 | The complete editor works offline after a visit | Missing |
| 12 | Reduced-motion mode replaces continuous playback | Missing |
| 13 | The layout works at 390 px | Missing |
| 14 | No account is used | Missing |
| 15 | No analytics, advertising, tracking, third-party script, or runtime service is used | Missing |
| 16 | Curve values, exports, and settings are not sent away | Missing |
| 17 | Share values stay in the URL fragment and are not sent in HTTP requests | Missing |
| 18 | Exported CSS is “production-ready” | Untestable wording; remove or replace |

Independent checks support many of these behaviors, but the claims contract still requires the missing manifest and tagged tests.

### Major 3 — The first screen does not meet the required plain-words structure

The heading does not name the job. The next sentence does not name the audience. The primary action is not the sample action and is partly cut off on a 390 × 844 phone. The three facts are combined into one line instead of three short lines. Several labels use metaphor or decorative product lore. `.factory/copy-audit.md` is missing.

Expected: a job title of nine words or fewer, one sentence naming the user and situation, a visible sample action with its result, and three separate facts.

### Major 4 — Unknown URLs do not return the required designed 404

`/definitely-missing-review-1` and `/404` both return HTTP 200 and render the home page with its home title and heading. This is not a deliberate 404 response. It is the absence of the required 404 route and recovery page.

Expected: HTTP 404, a product-specific missing-page design, its own title and heading, and a link home.

### Minor 5 — Required route structure and metadata are incomplete

The root has no canonical link, Twitter card, or Apple touch icon. Its Open Graph image is a relative 1200 × 800 image, not the required 1200 × 630 social image. `/demo` has the home title and is absent from the sitemap. The root navigation omits Demo and Privacy. Privacy and Terms have no navigation or footer. The footer omits “Built by Param Factory” and the build id. The external Sociobot link is not identified in text as external.

### Minor 6 — Some touch targets are smaller than 44 × 44 CSS pixels

At desktop size, both SVG curve handles measure about 42 × 42 CSS pixels. The Terms footer link measures about 38 × 44 on desktop and phone. Other measured controls met the target size, and neither viewport had horizontal overflow.

### Minor 7 — The earlier response-header finding is unresolved

The 2026-08-28 verification recorded missing CSP and clickjacking protection plus a 126-day HSTS duration. The live root still has no `Content-Security-Policy`, `frame-ancestors`, or `X-Frame-Options`. HSTS is unchanged at `max-age=10886400`. The repository configuration also lacks the required CSP response header.

## Earlier findings

The earlier report listed one Minor finding. Its current disposition is **open**, as shown in Minor 7. Its Lighthouse browser crash was informational, not a product defect. This review completed Lighthouse normally.

## Checks that passed

- Clean setup: Node `v22.23.2`, npm `10.9.8`, and `npm ci` completed with 0 vulnerabilities.
- `npm run check`: 5/5 unit tests, production type-check/build, and 16/16 desktop/mobile Playwright tests passed.
- Build output: JS 19,495 bytes (6,857 gzip), CSS 17,924 bytes (4,691 gzip), and `dist/index.html` exists.
- Live parity: root, Privacy, Terms, JS, CSS, and both images match local build SHA-256 hashes.
- Fresh desktop and phone pages: no console or page errors, one `h1`, `lang="en"`, `main`, image alt text, and no horizontal overflow.
- Axe: no violations in independent live desktop or phone scans. The repository suite also reports no serious or critical findings.
- Keyboard: the skip link is first, curve handles respond to arrows, and tab sets respond to left and right arrows. Focus styling is visible.
- Normal path: Elastic echo populated both curves; boundary values `0`, `-0.5`, `1`, and `1.5` appeared in output; the frame strips contained 2, 4, and 8 samples.
- Export path: JavaScript copy and the downloaded `motion-feel.js` matched the displayed output. Share copy produced a URL fragment.
- Recovery: reset restored Soft arrival and 700 ms. A damaged share fragment and corrupt local storage both restored a usable default with an error message.
- Reduced motion: Play showed `t 1.00` and the end-state explanation without continuous movement.
- Offline/update: the service worker update completed; a fresh cached phone context reloaded offline and the editor stayed usable.
- Privacy request capture: the full editor flow requested only `https://motion-curve-playground.sociobot.in`.
- Internal links and legal pages loaded. The external Sociobot target was not fetched because the work order forbids connecting to another service.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.0 s, TBT 100 ms, CLS 0, 24 KiB transferred.
- AI missed-leverage check: no AI feature is needed for this focused curve editor. The brief explicitly distinguishes it from generative animation. Export is already present.
- Backend, tenant, rate-limit, restart, CLI, library, and desktop checks are not applicable to this static web product.

## Evidence

- `/work/.evidence/live-audit.json`
- `/work/.evidence/desktop-first-screen.png`
- `/work/.evidence/phone-first-screen.png`
- `/work/.evidence/demo-route-phone.png`
- `/work/.evidence/verify-url/verify.json`
- `/work/.evidence/lighthouse-live.json`

The live runtime matches the last implementation candidate. The later commit only added verification documentation, so no separate product image is expected.
