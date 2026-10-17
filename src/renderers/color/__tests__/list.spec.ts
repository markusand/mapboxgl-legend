import { describe, it, expect, vi } from 'vite-plus/test';
import list from '../list';
import type { MapboxMap, ParsedExpression } from '/@/types';

const map = { setFilter: () => {} } as unknown as MapboxMap;

describe('Color list panel', () => {
  it('should create a panel colors list for numbers', () => {
    const expression: ParsedExpression<number, string> = {
      name: 'match',
      getter: ['get', 'attribute'],
      stops: [
        [1, '#f00'],
        [2, '#0f0'],
        [3, '#00f'],
      ],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const el = list(
      expression,
      { id: '_', type: 'circle' },
      { labels: { 1: 'one', 3: 'three' } },
      map,
    );

    expect(el?.tagName).toBe('UL');
    expect(el?.classList.contains('list')).toBeTruthy();
    expect(el?.classList.contains('list--color')).toBeTruthy();
    expect(el?.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el || {};
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('one');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('three');
  });

  it('should create a panel of colors list for numbers range', () => {
    const expression: ParsedExpression<number[], string> = {
      name: 'step',
      getter: ['get', 'attribute'],
      stops: [
        [[1, 5], '#f00'],
        [[5, 10], '#0f0'],
        [[10, 15], '#00f'],
      ],
      inputs: [
        [1, 5],
        [5, 10],
        [10, 15],
      ],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 15,
    };
    const el = list(expression, { id: '_', type: 'circle' }, { unit: 'k' }, map);

    expect(el?.tagName).toBe('UL');
    expect(el?.classList.contains('list')).toBeTruthy();
    expect(el?.classList.contains('list--color')).toBeTruthy();
    expect(el?.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el || {};
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('1k - 5k');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('10k - 15k');
  });

  it('should create a panel of colors list for numbers range', () => {
    const expression: ParsedExpression<string, string> = {
      name: 'match',
      getter: ['get', 'attribute'],
      stops: [
        ['low', '#f00'],
        ['medium', '#0f0'],
        ['high', '#00f'],
      ],
      inputs: ['low', 'medium', 'high'],
      outputs: ['#f00', '#0f0', '#00f'],
      min: NaN,
      max: NaN,
    };
    const el = list(
      expression,
      { id: '_', type: 'circle' },
      { labels: { low: 'baix', medium: 'mig', high: 'alt' } },
      map,
    );

    expect(el?.tagName).toBe('UL');
    expect(el?.classList.contains('list')).toBeTruthy();
    expect(el?.classList.contains('list--color')).toBeTruthy();
    expect(el?.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el || {};
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--color: #f00;');
    expect(first?.textContent).toBe('baix');
    expect(last?.getAttribute('style')).toBe('--color: #00f;');
    expect(last?.textContent).toBe('alt');
  });

  it('should hide an item with label set to false', () => {
    const expression: ParsedExpression<number, string> = {
      name: 'match',
      getter: ['get', 'attribute'],
      stops: [
        [1, '#f00'],
        [2, '#0f0'],
        [3, '#00f'],
      ],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const el = list(expression, { id: '_', type: 'circle' }, { labels: { 2: false } }, map);

    expect(el?.childElementCount).toBe(2);
  });

  it('should set legend highlighting', () => {
    const expression: ParsedExpression<number, string> = {
      name: 'match',
      getter: ['get', 'attribute'],
      stops: [
        [1, '#f00'],
        [2, '#0f0'],
        [3, '#00f'],
      ],
      inputs: [1, 2, 3],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 1,
      max: 3,
    };
    const el = list(
      expression,
      { id: '_', type: 'circle' },
      { highlight: true, labels: { 2: false } },
      map,
    );

    const setFilter = vi.spyOn(map, 'setFilter');
    el?.firstElementChild?.dispatchEvent(new Event('mouseenter'));
    el?.firstElementChild?.dispatchEvent(new Event('mouseleave'));
    expect(setFilter).toHaveBeenCalledTimes(2);
  });
});
