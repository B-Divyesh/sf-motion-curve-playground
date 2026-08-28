import { PRESETS, clamp, formatCurve, isCurve, sampleCurve, type Curve } from './curve';

type CurveKind = 'position' | 'rotation';
type ExportKind = 'css' | 'js';

interface LabState {
  position: Curve;
  rotation: Curve;
  activeCurve: CurveKind;
  exportKind: ExportKind;
  presetId: string;
  duration: number;
}

interface StoredState {
  position: Curve;
  rotation: Curve;
  presetId?: string;
  duration: number;
}

const DEFAULT_PRESET = PRESETS[0]!;
const STORAGE_KEY = 'motion-feel-lab:v1';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Motion lab mount point was not found.');

const state: LabState = {
  position: DEFAULT_PRESET.position,
  rotation: DEFAULT_PRESET.rotation,
  activeCurve: 'position',
  exportKind: 'css',
  presetId: DEFAULT_PRESET.id,
  duration: 700,
};

app.innerHTML = `
  <div class="lab-status" id="lab-status" role="status" aria-live="polite" hidden></div>
  <div class="preset-block">
    <div class="instrument-label"><span>01</span><h3>Choose an intent</h3></div>
    <div class="preset-grid" role="group" aria-label="Motion intent starting points">
      ${PRESETS.map((preset, index) => `
        <button class="preset" type="button" data-preset="${preset.id}" aria-pressed="${index === 0}">
          <span class="preset-index">0${index + 1}</span>
          <strong>${preset.name}</strong>
          <span>${preset.cue}</span>
        </button>
      `).join('')}
    </div>
  </div>

  <div class="workbench">
    <section class="preview-deck" aria-labelledby="preview-title">
      <div class="panel-heading">
        <div><span class="panel-number">02</span><h3 id="preview-title">Preview the move</h3></div>
        <span class="panel-readout" id="preview-readout">t 0.00</span>
      </div>
      <div class="motion-stage" id="motion-stage" role="img" aria-label="Animated preview: the square moves left to right while rotating">
        <div class="stage-grid" aria-hidden="true"></div>
        <div class="stage-axis" aria-hidden="true"><span>START</span><span>END</span></div>
        <div class="onion-path" id="onion-path" aria-hidden="true"></div>
        <div class="probe" id="probe" aria-hidden="true"><span></span></div>
      </div>
      <div class="preview-controls">
        <button class="button button-primary play-button" id="play-button" type="button"><span aria-hidden="true">▶</span> Play move</button>
        <label class="select-label" for="duration"><span>Duration</span>
          <select id="duration">
            <option value="400">400 ms</option>
            <option value="700" selected>700 ms</option>
            <option value="1200">1,200 ms</option>
            <option value="1800">1,800 ms</option>
          </select>
        </label>
        <button class="button button-quiet" id="reset-button" type="button">Reset curve</button>
      </div>
    </section>

    <section class="curve-deck" aria-labelledby="curve-title">
      <div class="panel-heading">
        <div><span class="panel-number">03</span><h3 id="curve-title">Edit the curves</h3></div>
        <span class="panel-readout" id="curve-readout"></span>
      </div>
      <div class="curve-tabs" role="tablist" aria-label="Curve to edit">
        <button type="button" role="tab" id="position-tab" aria-controls="curve-editor" aria-selected="true" data-curve="position"><i aria-hidden="true"></i>Position</button>
        <button type="button" role="tab" id="rotation-tab" aria-controls="curve-editor" aria-selected="false" data-curve="rotation"><i aria-hidden="true"></i>Rotation</button>
      </div>
      <div id="curve-editor" role="tabpanel" aria-labelledby="position-tab">
        <svg class="curve-chart" id="curve-chart" viewBox="0 0 320 280" role="group" aria-labelledby="chart-title chart-desc">
          <title id="chart-title">Editable position curve</title>
          <desc id="chart-desc">A cubic bezier timing graph. Drag either square handle or use the controls below.</desc>
          <g class="chart-grid" aria-hidden="true">
            <path d="M20 20V260M90 20V260M160 20V260M230 20V260M300 20V260M20 20H300M20 80H300M20 140H300M20 200H300M20 260H300" />
            <path class="chart-zero" d="M20 200H300" />
          </g>
          <path id="inactive-curve" class="curve-path inactive" aria-hidden="true" />
          <g class="handle-lines" aria-hidden="true"><path id="handle-line-1" /><path id="handle-line-2" /></g>
          <path id="active-curve" class="curve-path active" aria-hidden="true" />
          <circle class="curve-node start" cx="20" cy="200" r="4" aria-hidden="true" />
          <circle class="curve-node end" cx="300" cy="80" r="4" aria-hidden="true" />
          <rect class="curve-handle" id="handle-1" width="16" height="16" rx="2" tabindex="0" role="button" aria-label="First control point" />
          <rect class="curve-handle" id="handle-2" width="16" height="16" rx="2" tabindex="0" role="button" aria-label="Second control point" />
          <text x="20" y="275">0%</text><text x="278" y="275">100%</text>
        </svg>
        <div class="curve-inputs" id="curve-inputs">
          ${(['x1', 'y1', 'x2', 'y2'] as const).map((label, index) => `
            <label><span>${label.toUpperCase()} <output id="${label}-output">${DEFAULT_PRESET.position[index]}</output></span>
              <input type="range" id="${label}" data-index="${index}" min="${index % 2 === 0 ? 0 : -0.5}" max="${index % 2 === 0 ? 1 : 1.5}" step="0.01" value="${DEFAULT_PRESET.position[index]}" />
            </label>
          `).join('')}
        </div>
        <p class="curve-help">X sets when the handle acts. Y sets how far the motion has progressed; values above 1 overshoot.</p>
      </div>
    </section>
  </div>

  <section class="comparison-deck" aria-labelledby="comparison-title">
    <div class="panel-heading comparison-heading">
      <div><span class="panel-number">04</span><h3 id="comparison-title">Compare frame samples</h3></div>
      <p>Same move, three temporal resolutions. Each square is one rendered frame.</p>
    </div>
    <div class="comparison-grid" id="comparison-grid"></div>
  </section>

  <section class="export-deck" aria-labelledby="export-title">
    <div class="export-copy">
      <div class="panel-heading"><div><span class="panel-number">05</span><h3 id="export-title">Take it with you</h3></div></div>
      <p>CSS uses nested elements so travel and turn keep separate timing. JavaScript provides a deterministic sampler for canvas, games, or custom runtimes.</p>
      <button class="button button-secondary" id="share-button" type="button">Copy share link</button>
    </div>
    <div class="code-panel">
      <div class="code-toolbar">
        <div class="code-tabs" role="tablist" aria-label="Export format">
          <button type="button" role="tab" aria-selected="true" data-export="css">CSS</button>
          <button type="button" role="tab" aria-selected="false" data-export="js">JavaScript</button>
        </div>
        <div><button class="icon-button" id="download-button" type="button">Download</button><button class="button button-primary copy-button" id="copy-button" type="button">Copy code</button></div>
      </div>
      <pre tabindex="0" aria-label="Generated export code"><code id="export-code"></code></pre>
    </div>
  </section>
`;
app.setAttribute('aria-busy', 'false');

function requiredElement<T extends Element>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Required element missing: ${selector}`);
  return element;
}

const stage = requiredElement<HTMLDivElement>('#motion-stage');
const probe = requiredElement<HTMLDivElement>('#probe');
const onionPath = requiredElement<HTMLDivElement>('#onion-path');
const playButton = requiredElement<HTMLButtonElement>('#play-button');
const durationSelect = requiredElement<HTMLSelectElement>('#duration');
const statusRegion = requiredElement<HTMLDivElement>('#lab-status');
const comparisonGrid = requiredElement<HTMLDivElement>('#comparison-grid');
const exportCode = requiredElement<HTMLElement>('#export-code');
const curveChart = requiredElement<SVGSVGElement>('#curve-chart');

let animationFrame = 0;
let animationStart = 0;
let draggingHandle: 0 | 1 | null = null;
let statusTimer = 0;

function activeCurve(): Curve {
  return state[state.activeCurve];
}

function updateActiveCurve(next: Curve): void {
  state[state.activeCurve] = next;
  state.presetId = 'custom';
  renderAll();
  saveState();
}

function announce(message: string, tone: 'info' | 'error' = 'info'): void {
  window.clearTimeout(statusTimer);
  statusRegion.textContent = message;
  statusRegion.dataset.tone = tone;
  statusRegion.hidden = false;
  statusTimer = window.setTimeout(() => { statusRegion.hidden = true; }, 4800);
}

const mapX = (value: number): number => 20 + value * 280;
const mapY = (value: number): number => 260 - (value + 0.5) * 120;
const unmapX = (value: number): number => clamp((value - 20) / 280, 0, 1);
const unmapY = (value: number): number => clamp((260 - value) / 120 - 0.5, -0.5, 1.5);

function curvePath(curve: Curve): string {
  return `M20 200 C${mapX(curve[0])} ${mapY(curve[1])}, ${mapX(curve[2])} ${mapY(curve[3])}, 300 80`;
}

function renderCurveEditor(): void {
  const curve = activeCurve();
  const other = state.activeCurve === 'position' ? state.rotation : state.position;
  requiredElement<SVGPathElement>('#active-curve').setAttribute('d', curvePath(curve));
  requiredElement<SVGPathElement>('#inactive-curve').setAttribute('d', curvePath(other));
  requiredElement<SVGPathElement>('#handle-line-1').setAttribute('d', `M20 200L${mapX(curve[0])} ${mapY(curve[1])}`);
  requiredElement<SVGPathElement>('#handle-line-2').setAttribute('d', `M300 80L${mapX(curve[2])} ${mapY(curve[3])}`);

  ([0, 1] as const).forEach((handleIndex) => {
    const valueIndex = handleIndex * 2;
    const x = curve[valueIndex]!;
    const y = curve[valueIndex + 1]!;
    const handle = requiredElement<SVGRectElement>(`#handle-${handleIndex + 1}`);
    handle.setAttribute('x', String(mapX(x) - 8));
    handle.setAttribute('y', String(mapY(y) - 8));
    handle.setAttribute('aria-label', `${handleIndex === 0 ? 'First' : 'Second'} control point, X ${x.toFixed(2)}, Y ${y.toFixed(2)}. Use arrow keys to adjust.`);
  });

  curve.forEach((value, index) => {
    const input = requiredElement<HTMLInputElement>(`#curve-inputs input[data-index="${index}"]`);
    const output = requiredElement<HTMLOutputElement>(`#${['x1', 'y1', 'x2', 'y2'][index]}-output`);
    input.value = String(value);
    output.value = value.toFixed(2);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-curve]').forEach((button) => {
    const selected = button.dataset.curve === state.activeCurve;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  const title = requiredElement<SVGTitleElement>('#chart-title');
  title.textContent = `Editable ${state.activeCurve} curve`;
  requiredElement<HTMLDivElement>('#curve-editor').setAttribute('aria-labelledby', `${state.activeCurve}-tab`);
  requiredElement<HTMLElement>('#curve-readout').textContent = formatCurve(curve);
}

function renderOnionPath(): void {
  const travel = Math.max(0, stage.clientWidth - 88);
  onionPath.replaceChildren();
  for (let index = 0; index < 7; index += 1) {
    const progress = index / 6;
    const position = sampleCurve(state.position, progress);
    const rotation = sampleCurve(state.rotation, progress) * 90;
    const sample = document.createElement('span');
    sample.className = 'onion-sample';
    sample.style.transform = `translate3d(${clamp(position, -0.08, 1.08) * travel}px, 0, 0) rotate(${rotation}deg)`;
    sample.style.opacity = String(0.12 + index * 0.025);
    onionPath.append(sample);
  }
}

function renderComparison(): void {
  comparisonGrid.replaceChildren();
  for (const frameCount of [2, 4, 8]) {
    const article = document.createElement('article');
    article.className = 'comparison-row';
    const label = document.createElement('div');
    label.className = 'comparison-label';
    label.innerHTML = `<strong>${frameCount} frames</strong><span>${frameCount === 2 ? 'Pose test' : frameCount === 4 ? 'Read test' : 'Nuance test'}</span>`;
    const strip = document.createElement('div');
    strip.className = 'frame-strip';
    strip.setAttribute('role', 'img');
    strip.setAttribute('aria-label', `${frameCount} frame sample of the current motion`);
    for (let index = 0; index < frameCount; index += 1) {
      const progress = frameCount === 1 ? 1 : index / (frameCount - 1);
      const position = sampleCurve(state.position, progress);
      const rotation = sampleCurve(state.rotation, progress) * 90;
      const frame = document.createElement('span');
      frame.className = 'sample-frame';
      frame.style.left = `${clamp(position, -0.04, 1.04) * 100}%`;
      frame.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
      frame.setAttribute('aria-hidden', 'true');
      strip.append(frame);
    }
    article.append(label, strip);
    comparisonGrid.append(article);
  }
}

function cssExport(): string {
  return `/* Nest the rotating element inside the travelling element. */
.motion-position {
  animation: travel ${state.duration}ms ${formatCurve(state.position)} both;
}

.motion-rotation {
  animation: turn ${state.duration}ms ${formatCurve(state.rotation)} both;
}

@keyframes travel {
  from { transform: translateX(0); }
  to   { transform: translateX(var(--motion-distance, 240px)); }
}

@keyframes turn {
  from { transform: rotate(0deg); }
  to   { transform: rotate(var(--motion-turn, 90deg)); }
}

@media (prefers-reduced-motion: reduce) {
  .motion-position, .motion-rotation { animation: none; }
  .motion-position { transform: translateX(var(--motion-distance, 240px)); }
  .motion-rotation { transform: rotate(var(--motion-turn, 90deg)); }
}`;
}

function jsExport(): string {
  return `const motion = {
  duration: ${state.duration},
  position: [${state.position.join(', ')}],
  rotation: [${state.rotation.join(', ')}]
};

const cubic = (t, a, b) =>
  3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;

function sampleBezier([x1, y1, x2, y2], progress) {
  let low = 0, high = 1, t = progress;
  for (let i = 0; i < 16; i++) {
    const x = cubic(t, x1, x2);
    if (x < progress) low = t; else high = t;
    t = (low + high) / 2;
  }
  return cubic(t, y1, y2);
}

// Call with elapsed / motion.duration, clamped from 0 to 1.
function sampleMotion(progress) {
  const t = Math.min(1, Math.max(0, progress));
  return {
    position: sampleBezier(motion.position, t),
    rotation: sampleBezier(motion.rotation, t)
  };
}`;
}

function renderExport(): void {
  exportCode.textContent = state.exportKind === 'css' ? cssExport() : jsExport();
  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => {
    const selected = button.dataset.export === state.exportKind;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function renderPresets(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.preset === state.presetId));
  });
}

function updateProbe(progress: number): void {
  const travel = Math.max(0, stage.clientWidth - 88);
  const position = sampleCurve(state.position, progress);
  const rotation = sampleCurve(state.rotation, progress) * 90;
  probe.style.transform = `translate3d(${clamp(position, -0.08, 1.08) * travel}px, 0, 0) rotate(${rotation}deg)`;
  requiredElement<HTMLElement>('#preview-readout').textContent = `t ${progress.toFixed(2)}`;
}

function renderAll(): void {
  renderPresets();
  renderCurveEditor();
  renderOnionPath();
  renderComparison();
  renderExport();
  updateProbe(0);
}

function play(): void {
  window.cancelAnimationFrame(animationFrame);
  if (reduceMotion.matches) {
    updateProbe(1);
    announce('Reduced motion is on. Showing the move at its end state; use the frame strips to inspect timing.');
    return;
  }
  animationStart = performance.now();
  playButton.disabled = true;
  playButton.innerHTML = '<span aria-hidden="true">■</span> Playing';
  const tick = (now: number): void => {
    const progress = clamp((now - animationStart) / state.duration, 0, 1);
    updateProbe(progress);
    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(tick);
    } else {
      playButton.disabled = false;
      playButton.innerHTML = '<span aria-hidden="true">↻</span> Play again';
    }
  };
  animationFrame = window.requestAnimationFrame(tick);
}

function saveState(): void {
  const stored: StoredState = {
    position: state.position,
    rotation: state.rotation,
    presetId: state.presetId,
    duration: state.duration,
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* Storage may be unavailable. */ }
}

function applyStored(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredState>;
  if (!isCurve(candidate.position) || !isCurve(candidate.rotation)) return false;
  if (typeof candidate.duration !== 'number' || ![400, 700, 1200, 1800].includes(candidate.duration)) return false;
  state.position = candidate.position;
  state.rotation = candidate.rotation;
  state.duration = candidate.duration;
  state.presetId = typeof candidate.presetId === 'string' ? candidate.presetId : 'custom';
  durationSelect.value = String(state.duration);
  return true;
}

function restoreState(): void {
  if (location.hash.startsWith('#curve=')) {
    try {
      const decoded = JSON.parse(decodeURIComponent(location.hash.slice(7))) as unknown;
      if (!applyStored(decoded)) throw new Error('Invalid curve values');
      announce('Shared curve loaded from this link.');
      return;
    } catch {
      announce('This share link is damaged. The default curve is loaded instead.', 'error');
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyStored(JSON.parse(stored) as unknown);
  } catch {
    announce('Saved settings could not be read. The default curve is ready.', 'error');
  }
}

function pointFromEvent(event: PointerEvent): { x: number; y: number } {
  const point = curveChart.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = curveChart.getScreenCTM();
  if (!matrix) return { x: 20, y: 200 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    const preset = PRESETS.find((item) => item.id === button.dataset.preset);
    if (!preset) return;
    state.position = preset.position;
    state.rotation = preset.rotation;
    state.presetId = preset.id;
    renderAll();
    saveState();
    announce(`${preset.name} loaded. Position and rotation curves updated.`);
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-curve]').forEach((button) => {
  button.addEventListener('click', () => {
    state.activeCurve = button.dataset.curve as CurveKind;
    renderCurveEditor();
  });
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    state.activeCurve = state.activeCurve === 'position' ? 'rotation' : 'position';
    renderCurveEditor();
    requiredElement<HTMLButtonElement>(`#${state.activeCurve}-tab`).focus();
  });
});

document.querySelectorAll<HTMLInputElement>('#curve-inputs input').forEach((input) => {
  input.addEventListener('input', () => {
    const index = Number(input.dataset.index);
    const next = [...activeCurve()] as [number, number, number, number];
    next[index] = Number(input.value);
    updateActiveCurve(next);
  });
});

document.querySelectorAll<SVGRectElement>('.curve-handle').forEach((handle, handleIndex) => {
  handle.addEventListener('pointerdown', (event) => {
    draggingHandle = handleIndex as 0 | 1;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', (event) => {
    if (draggingHandle !== handleIndex) return;
    const point = pointFromEvent(event);
    const next = [...activeCurve()] as [number, number, number, number];
    next[handleIndex * 2] = Number(unmapX(point.x).toFixed(2));
    next[handleIndex * 2 + 1] = Number(unmapY(point.y).toFixed(2));
    updateActiveCurve(next);
  });
  handle.addEventListener('pointerup', () => { draggingHandle = null; });
  handle.addEventListener('keydown', (event) => {
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    const step = event.shiftKey ? 0.05 : 0.01;
    const next = [...activeCurve()] as [number, number, number, number];
    const xIndex = handleIndex * 2;
    const yIndex = xIndex + 1;
    if (event.key === 'ArrowLeft') next[xIndex] = clamp(next[xIndex]! - step, 0, 1);
    if (event.key === 'ArrowRight') next[xIndex] = clamp(next[xIndex]! + step, 0, 1);
    if (event.key === 'ArrowDown') next[yIndex] = clamp(next[yIndex]! - step, -0.5, 1.5);
    if (event.key === 'ArrowUp') next[yIndex] = clamp(next[yIndex]! + step, -0.5, 1.5);
    updateActiveCurve(next);
  });
});

playButton.addEventListener('click', play);
durationSelect.addEventListener('change', () => {
  state.duration = Number(durationSelect.value);
  renderExport();
  saveState();
  announce(`Duration set to ${state.duration} milliseconds.`);
});

requiredElement<HTMLButtonElement>('#reset-button').addEventListener('click', () => {
  state.position = DEFAULT_PRESET.position;
  state.rotation = DEFAULT_PRESET.rotation;
  state.presetId = DEFAULT_PRESET.id;
  state.duration = 700;
  durationSelect.value = '700';
  renderAll();
  saveState();
  announce('Curve reset to Soft arrival.');
});

document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => {
  button.addEventListener('click', () => {
    state.exportKind = button.dataset.export as ExportKind;
    renderExport();
  });
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    state.exportKind = state.exportKind === 'css' ? 'js' : 'css';
    renderExport();
    requiredElement<HTMLButtonElement>(`[data-export="${state.exportKind}"]`).focus();
  });
});

async function copyText(text: string, successMessage: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    announce(successMessage);
  } catch {
    announce('Copy was blocked by the browser. Select the code and copy it manually.', 'error');
  }
}

requiredElement<HTMLButtonElement>('#copy-button').addEventListener('click', () => {
  void copyText(exportCode.textContent ?? '', `${state.exportKind === 'css' ? 'CSS' : 'JavaScript'} copied to the clipboard.`);
});

requiredElement<HTMLButtonElement>('#share-button').addEventListener('click', () => {
  const payload: StoredState = { position: state.position, rotation: state.rotation, presetId: state.presetId, duration: state.duration };
  const url = new URL(location.href);
  url.hash = `curve=${encodeURIComponent(JSON.stringify(payload))}`;
  void copyText(url.toString(), 'Share link copied. It contains the curve values, not personal data.');
});

requiredElement<HTMLButtonElement>('#download-button').addEventListener('click', () => {
  const blob = new Blob([exportCode.textContent ?? ''], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `motion-feel.${state.exportKind === 'css' ? 'css' : 'js'}`;
  link.click();
  URL.revokeObjectURL(link.href);
  announce(`${link.download} downloaded.`);
});

const offlineBar = requiredElement<HTMLElement>('#offline-bar');
function updateOnlineStatus(): void {
  offlineBar.hidden = navigator.onLine;
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
window.addEventListener('resize', () => { renderOnionPath(); updateProbe(0); });
reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) window.cancelAnimationFrame(animationFrame); });

restoreState();
renderAll();
updateOnlineStatus();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
}
