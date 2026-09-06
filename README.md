# Motion Feel Lab

Edit motion curves for animation. It is for indie animators and game or UI makers who need timing to read at a few frames.

Try the one-click sample at <https://motion-curve-playground.sociobot.in/demo>. It opens an Elastic echo curve at 1,200 ms in separate demo storage.

## What it does

- Provides six selectable starting curves.
- Edits position and rotation curves with range controls and keyboard-adjustable graph handles.
- Compares the same curve at 2, 4, and 8 frames.
- Exports CSS and JavaScript, downloads an export file, and copies a share link.
- Works offline after the first visit and respects reduced-motion preferences.
- Fits a 390 pixel mobile viewport.

Use it to compare timing, then use your animation tool for scenes and video.

## Demo and privacy

`/demo` is the documented sandbox route. It loads a realistic Elastic echo sample with position and rotation curves at 1,200 ms. Its data uses the `demo:motion-feel-lab:v1` browser-storage key. Demo edits cannot change `motion-feel-lab:v1`, the normal editor key. **Reset demo** restores the sample. **Start for real** discards the demo key and opens the normal editor.

No account is needed for the sample. Curve values, exports, and settings are not sent outside this site during the sample flow. A copied share link carries curve values in its URL fragment, not in an HTTP request. The full user-facing disclosure is on [/privacy/](/privacy/).

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Use `/demo` to open the sample sandbox.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
npm run check
```

`npm run test:e2e` builds the site and runs Chromium desktop and 390px mobile checks through the Azure Static Web Apps emulator. The emulator verifies the configured 404 response and security headers. Playwright 1.58.2 is pinned. If Chromium is not available, run:

```sh
npx playwright install chromium
```

Every visitor-facing product claim is listed in [`.factory/claims.json`](.factory/claims.json). Each entry gives its own clean command and demo-only browser sandbox.

## Deploy

Run `npm run build`. It produces `dist/` with `index.html` at its root. Deploy `dist/` as this product’s Azure Static Web Apps artifact. `public/staticwebapp.config.json` supplies navigation fallback, the intentional 404 response, caching, and response headers.

## Design and assets

The Signal Garden visual system is documented in [`.factory/design.md`](.factory/design.md). The hero artwork is an original product asset. Its prompt and source material are in `assets/src/`; responsive WebP versions and the social crop ship from `public/assets/`.

## License

MIT — see [LICENSE](LICENSE).
