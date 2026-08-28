import { describe, expect, it } from 'vitest';
import { formatCurve, isCurve, sampleCurve } from './curve';

describe('sampleCurve', () => {
  it('keeps linear motion aligned with time', () => {
    expect(sampleCurve([0, 0, 1, 1], 0.25)).toBeCloseTo(0.25, 4);
    expect(sampleCurve([0, 0, 1, 1], 0.75)).toBeCloseTo(0.75, 4);
  });

  it('returns exact endpoints', () => {
    expect(sampleCurve([0.2, 1.2, 0.5, 0.8], 0)).toBe(0);
    expect(sampleCurve([0.2, 1.2, 0.5, 0.8], 1)).toBe(1);
  });

  it('supports expressive y values above one', () => {
    expect(sampleCurve([0.24, 0.94, 0.52, 1.16], 0.8)).toBeGreaterThan(1);
  });
});

describe('curve serialization', () => {
  it('formats a CSS cubic bezier', () => {
    expect(formatCurve([0.18, 0.72, 0.24, 1])).toBe('cubic-bezier(0.18, 0.72, 0.24, 1)');
  });

  it('rejects invalid imported curves', () => {
    expect(isCurve([0.2, 0, 0.8, 1])).toBe(true);
    expect(isCurve([-1, 0, 0.8, 1])).toBe(false);
    expect(isCurve([0.2, 0, 2, 1])).toBe(false);
    expect(isCurve([0.2, 0, 0.8])).toBe(false);
  });
});
