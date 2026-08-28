export type Curve = readonly [number, number, number, number];

export interface MotionPreset {
  id: string;
  name: string;
  cue: string;
  position: Curve;
  rotation: Curve;
}

export const PRESETS: MotionPreset[] = [
  {
    id: 'soft-arrival',
    name: 'Soft arrival',
    cue: 'Moves early, then gives the landing room.',
    position: [0.18, 0.72, 0.24, 1],
    rotation: [0.28, 0.48, 0.3, 1],
  },
  {
    id: 'held-departure',
    name: 'Held departure',
    cue: 'Resists the first beat before committing.',
    position: [0.62, 0, 0.78, 0.52],
    rotation: [0.72, -0.08, 0.82, 0.42],
  },
  {
    id: 'heavy-settle',
    name: 'Heavy settle',
    cue: 'Travels with intent and eases into rest.',
    position: [0.16, 0.74, 0.3, 1],
    rotation: [0.2, 0.95, 0.48, 1.08],
  },
  {
    id: 'quick-response',
    name: 'Quick response',
    cue: 'Answers immediately, then spends time resolving.',
    position: [0.1, 0.82, 0.2, 1],
    rotation: [0.08, 0.88, 0.18, 1],
  },
  {
    id: 'elastic-echo',
    name: 'Elastic echo',
    cue: 'Passes the mark slightly before returning.',
    position: [0.24, 0.94, 0.52, 1.16],
    rotation: [0.3, 1.42, 0.58, 0.88],
  },
  {
    id: 'even-glide',
    name: 'Even glide',
    cue: 'Keeps time and distance closely aligned.',
    position: [0, 0, 1, 1],
    rotation: [0, 0, 1, 1],
  },
];

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const coordinate = (t: number, a: number, b: number): number => {
  const inv = 1 - t;
  return 3 * inv * inv * t * a + 3 * inv * t * t * b + t * t * t;
};

const derivative = (t: number, a: number, b: number): number => {
  const inv = 1 - t;
  return 3 * inv * inv * a + 6 * inv * t * (b - a) + 3 * t * t * (1 - b);
};

/** Samples a CSS-compatible cubic bezier by solving its x axis for time. */
export function sampleCurve(curve: Curve, progress: number): number {
  const [x1, y1, x2, y2] = curve;
  const target = clamp(progress, 0, 1);
  if (target === 0 || target === 1) return target;

  let t = target;
  for (let i = 0; i < 7; i += 1) {
    const slope = derivative(t, x1, x2);
    if (Math.abs(slope) < 1e-7) break;
    t = clamp(t - (coordinate(t, x1, x2) - target) / slope, 0, 1);
  }

  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i += 1) {
    const x = coordinate(t, x1, x2);
    if (Math.abs(x - target) < 1e-7) break;
    if (x < target) low = t;
    else high = t;
    t = (low + high) / 2;
  }
  return coordinate(t, y1, y2);
}

export function formatCurve(curve: Curve): string {
  return `cubic-bezier(${curve.map((value) => Number(value.toFixed(2))).join(', ')})`;
}

export function isCurve(value: unknown): value is Curve {
  return Array.isArray(value)
    && value.length === 4
    && value.every((item, index) => typeof item === 'number'
      && Number.isFinite(item)
      && item >= (index % 2 === 0 ? 0 : -0.5)
      && item <= (index % 2 === 0 ? 1 : 1.5));
}
