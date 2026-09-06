# Demo sandbox

- Demo URL: `/demo` or `/?demo=1`
- Sample: Elastic echo with separate position and rotation cubic-bezier curves at 1,200 ms.
- Storage namespace: `demo:motion-feel-lab:v1` in browser local storage.
- Normal storage namespace: `motion-feel-lab:v1`.

Open `/demo` directly or choose **Try it with sample data** on the landing page. The demo banner remains visible while editing and says “Demo — sample data, nothing is saved.” Its populated preview, curve chart, and frame samples are available immediately.

**Reset demo** restores the Elastic echo sample in the demo namespace. **Start for real** removes the demo key and opens `/`. Demo mode never reads or writes the normal storage key. The claim test `@claim:demo-isolation` seeds a normal curve, changes the demo curve, and proves the normal value remains unchanged.

The offline claim starts in a dedicated fresh browser context at `/demo`, waits for the service worker, goes offline, and reloads that same demo URL. See `.factory/claims.json` for the exact command.
