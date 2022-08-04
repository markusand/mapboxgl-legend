import { describe, it, expect } from 'vitest';
import bubbles from './radius';
import type { ParsedExpression } from '/@/expression';

describe('Radius panel', () => {
  it('should create a panel with bubbles', () => {
    const expression: ParsedExpression<number, number> = {
      name: 'step',
      stops: [[1, 10], [2, 20], [3, 30]],
      inputs: [1, 2, 3],
      outputs: [10, 20, 30],
      min: 1,
      max: 3,
    };
    const metadata = { labels: { 1: 'one', 3: 'three' } };
    const el = bubbles(expression, { id: '_', type: '_', metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('bubbles')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--radius: 30px;');
    expect(first?.firstElementChild?.tagName).toBe('SPAN');
    expect(first?.firstElementChild?.textContent).toBe('three');
    expect(last?.getAttribute('style')).toBe('--radius: 10px;');
  });

  it('should hide an item with label set to false', () => {
    const expression: ParsedExpression<number, number> = {
      name: 'step',
      stops: [[1, 10], [2, 20], [3, 30]],
      inputs: [1, 2, 3],
      outputs: [10, 20, 30],
      min: 1,
      max: 3,
    };
    const metadata = { labels: { 1: 'one', 3: false } };
    const el = bubbles(expression, { id: '_', type: '_', metadata });

    expect(el.childElementCount).toBe(2);
  });
});
