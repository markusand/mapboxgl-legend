import { describe, it, expect } from 'vitest';
import gradient from './gradient';
import type { ParsedExpression } from '../../types';

describe('Color gradient panel', () => {
  it('should create a panel with colors gradient bar', () => {
    const expression: ParsedExpression<number, string> = {
      name: 'interpolate',
      getter: ['get', 'attribute'],
      stops: [[1, '#f00'], [2, '#0f0'], [3, '#00f']],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const el = gradient(expression, { id: '_', type: '_' }, {} as any, {});

    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('gradient')).toBeTruthy();
    expect(el.childElementCount).toBe(2);

    const { firstElementChild: labels, lastElementChild: bar } = el;
    expect(labels?.tagName).toBe('P');
    expect(labels?.childElementCount).toBe(3);

    expect(bar?.tagName).toBe('DIV');
    expect(bar?.classList.contains('bar')).toBeTruthy();
    // Cannot check background.image ¿?
  });

  it('should hide an item with label set to false', () => {
    const expression: ParsedExpression<number, string> = {
      name: 'interpolate',
      getter: ['get', 'attribute'],
      stops: [[1, '#f00'], [2, '#0f0'], [3, '#00f']],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const metadata = { labels: { 2: false } };
    const el = gradient(expression, { id: '_', type: '_', metadata }, {} as any, {});
    expect(el.firstElementChild?.childElementCount).toBe(2);
  });
});
