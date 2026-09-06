# Motion Feel Lab — visual thesis

## Direction and rationale

**Signal Garden**, a pixel/demoscene instrument panel. Expressive timing is usually hidden behind smooth bezier handles; this system makes it feel inspectable, sampled, and handmade. A near-black CRT field lets the moving subject and curve traces read like oscilloscope signals. Pixel edges, registration marks, scanline texture, and compact monospace labels recall tracker software without copying a specific product. The visual language is purposeful: discrete pixels stand for frames, continuous neon traces stand for interpolation, and the apricot “probe” is the object whose feel is being tuned.

This is intentionally a single dark treatment. A light theme would weaken the oscilloscope metaphor and make onion-skin samples less legible. All core text and controls meet contrast requirements against their surfaces.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Void | `#090b10` | Page background |
| Deck | `#111620` | Primary work surface |
| Raised | `#192230` | Control wells and secondary regions |
| Grid | `#29364a` | Rules, grid lines, inactive strokes |
| Paper | `#f2f5e9` | Primary text |
| Fog | `#aeb9bc` | Secondary text (7.8:1 on Void) |
| Signal | `#72f1b8` | Position curve, focus, positive feedback |
| Signal ink | `#062116` | Text on Signal |
| Pulse | `#ffb86b` | Moving probe, rotation curve |
| Alert | `#ff6b7a` | Invalid input and error messaging |
| Info | `#8aa9ff` | Informational states |

No generic gradients. Very shallow color bands are allowed inside the generated pixel artwork; product surfaces remain flat and crisp.

## Typography

- **Display / interface:** `ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace`. Uppercase only for tiny instrument labels, with generous tracking. Numbers use tabular figures.
- **Reading:** `Inter, ui-sans-serif, system-ui, sans-serif`. Inter is not downloaded at runtime; the system stack takes over when absent. Body is 16–18px at 1.55 line height.
- Scale: 12px instrument label, 14px metadata, 16px body, 20px section, 28px subhead, clamp(40px–76px) display. Exactly one `h1`.

## Spacing and shape

- Base unit: 4px. Repeated rhythm: 8, 12, 16, 24, 32, 48, 72px.
- Controls are at least 44px high with 8px minimum separation.
- Corners are 2–8px: precision-tool geometry, not pill-heavy lifestyle UI.
- A stepped 3px shadow offset communicates press/depth without blurry glass effects.
- Desktop: intro and live instrument share a broad 12-column field. Mobile stacks the stage, curve editor, controls, comparison strips, then export. Nothing essential is dropped; secondary explanatory copy is shortened by layout.

## Interaction grammar

- The current curve is a bright solid trace; the inactive curve is a quieter dashed trace.
- Drag bezier handles directly or adjust the four labeled range controls. Handles expose keyboard arrow adjustment and announce values.
- Presets are “intent starting points,” never authoritative emotional labels. Selecting one replaces both curves and immediately updates the sampled strips.
- Pressed controls shift by 2px into their shadow. Focus uses a 3px Signal outline with 3px offset.
- Copy/export gives immediate inline confirmation. Errors remain near the control and in a polite live region.
- Comparison strips always show the same move sampled at 2, 4, and 8 frames so temporal aliasing is visible without starting playback.

## Motion policy

- The preview uses elapsed time from `requestAnimationFrame`, never frame increments, so display refresh rate does not alter duration.
- UI transitions last 120–220ms and animate only opacity/transform. The moving probe follows the authored position and rotation curves over the chosen duration.
- Onion skins are static sampled states. No flicker, strobe, or rapid color cycling.
- Under `prefers-reduced-motion: reduce`, autoplay is disabled, UI transitions are instant, and the play action uses a scrubbed end-state demonstration instead of continuous movement. The comparison and curve editor remain fully informative.

## Original asset plan and provenance

### `signal-garden.webp`

- Purpose: a compact hero/world-building illustration showing continuous and sampled timing in the same visual language as the instrument. It is decorative context, not a product screenshot.
- Use case: `stylized-concept`; wide website hero artwork.
- Prompt: “A wide pixel-art demoscene landscape for a motion timing design tool. Near-black CRT void, an apricot square probe traveling along a mint-green luminous bezier signal path, clearly spaced onion-skin echoes, small navy instrument grids and star-like registration pixels, one quiet orbital arc, crisp 16-bit pixel clusters, limited palette of #090b10 #111620 #29364a #72f1b8 #ffb86b #f2f5e9, high contrast, strong negative space, no interface screenshot. No text, no letters, no numbers, no watermark, no logos, no people, no copyrighted characters, no gradients, no photorealism.”
- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-28.
- License/provenance: original AI-generated asset commissioned for this product; disclosed in the footer. Source PNG and prompt sidecar retained in `assets/src/`.

Review checklist: reject visible text, logos, unintended symbols, muddy antialiasing, misleading UI affordances, or palette drift. Final responsive WebP must be ≤300 KB.

All functional icons and curve drawings are original inline SVG/CSS geometry authored in this repository; no icon library or third-party runtime asset is used.

## Derived sharing assets

- `public/assets/motion-feel-social.png` is a 1200 × 630 center crop of the approved `signal-garden-1200.webp` artwork. It preserves the mint curve, sampled apricot probe, and CRT field for social cards without adding text or a new visual claim.
- `public/apple-touch-icon.png` is a 180 × 180 center crop of the same approved product artwork.
- Both were composed locally on 2026-09-05 from the original generated asset. No additional model output, stock asset, logo, or third-party image was used.
