import { describe, it, expect } from 'vitest';
import list from './list';
import type { ParsedExpression } from '/@/expression';
import type { Color } from '.';

describe('Color list panel', () => {
  it('should create a panel colors list for numbers', () => {
    const expression: ParsedExpression<number, Color> = {
      name: 'match',
      stops: [[1, '#f00'], [2, '#0f0'], [3, '#00f']],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const metadata = { labels: { 1: 'one', 3: 'three' } };
    const el = list(expression, { id: '_', type: '_', metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--color')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('one');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('three');
  });

  it('should create a panel of colors list for numbers range', () => {
    const expression: ParsedExpression<number[], Color> = {
      name: 'step',
      stops: [[[1, 5], '#f00'], [[5, 10], '#0f0'], [[10, 15], '#00f']],
      inputs: [[1, 5], [5, 10], [10, 15]],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 15,
    };
    const metadata = { unit: 'k' };
    const el = list(expression, { id: '_', type: '_', metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--color')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('1k - 5k');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('10k - 15k');
  });

  it('should create a panel of colors list for numbers range', () => {
    const expression: ParsedExpression<string, Color> = {
      name: 'match',
      stops: [['low', '#f00'], ['medium', '#0f0'], ['high', '#00f']],
      inputs: ['low', 'medium', 'high'],
      outputs: ['#f00', '#0f0', '#00f'],
      min: NaN,
      max: NaN,
    };
    const metadata = { labels: { low: 'baix', medium: 'mig', high: 'alt' } };
    const el = list(expression, { id: '_', type: '_', metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--color')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('baix');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('alt');
  });
});
