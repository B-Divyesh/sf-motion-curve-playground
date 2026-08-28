# Motion Feel Lab

Motion Feel Lab is a local-first timing instrument for indie animators and game/UI makers. It turns a descriptive motion quality into editable position and rotation curves, shows the same move as 2-, 4-, and 8-frame samples, and exports production-ready CSS or a deterministic JavaScript sampler.

Live site: <https://motion-curve-playground.sociobot.in>

## What it does

- Six descriptive intent presets: Soft arrival, Held departure, Heavy settle, Quick response, Elastic echo, and Even glide.
- Separate position and rotation cubic-bezier curves with direct handle dragging, keyboard adjustment, and labeled range inputs.
- Frame-rate-independent live preview plus static onion-skin path.
- Side-by-side 2/4/8-frame sampling to expose what survives at low temporal resolution.
- CSS and JavaScript export, file download, and URL-based sharing.
- Local persistence, offline shell, reduced-motion behavior, and responsive 390px layout.

Preset language is deliberately suggestive rather than universal: the real meaning of a curve depends on the object, distance, duration, sound, and surrounding action. Character rigging, physics simulation, generative animation, and video export are outside the v1 scope.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Vite prints the local development URL. There are no runtime API keys or third-party services.

## Test and build

```sh
npm test          # curve math unit tests
npm run build     # type-check and build to ./dist
npm run test:e2e  # Chromium desktop/mobile flows + axe scan
npm run check     # all of the above
```

Playwright is pinned to `1.58.2`. In a new environment, install its Chromium binary if one is not already provided:

```sh
npx playwright install chromium
```

The deployment build command is exactly `npm run build`. The static output is `dist/`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` documents. `public/staticwebapp.config.json` supplies Azure Static Web Apps routing, security headers, and cache policy.

## Keyboard use

- Tab reaches every control; Enter or Space activates buttons.
- Left/Right switches the Position/Rotation and CSS/JavaScript tab sets.
- Arrow keys adjust a focused graph handle; hold Shift for larger steps.
- Standard arrow keys adjust the four labeled range inputs.

## Privacy and assets

There is no account, analytics, advertising, or third-party runtime script. The most recent curve is stored in browser local storage; share links carry curve values in the URL fragment, which is not sent in HTTP requests. See [`privacy/index.html`](privacy/index.html) for the user-facing policy.

The hero illustration is an original AI-generated asset commissioned for this product. Its prompt, review notes, source, and generated sidecar live in `assets/src/`; optimized WebP derivatives ship from `public/assets/`. The complete product-specific visual system is documented in [`.factory/design.md`](.factory/design.md).

## License

MIT — see [LICENSE](LICENSE).
