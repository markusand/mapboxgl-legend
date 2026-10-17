import { describe, it, expect, vi } from 'vite-plus/test';
import bubbles from '../radius';
import type { MapboxMap, ParsedExpression } from '/@/types';

const map = { setFilter: () => {} } as unknown as MapboxMap;

describe('Radius panel', () => {
  it('should create a panel with bubbles', () => {
    const expression: ParsedExpression<number, number> = {
      name: 'step',
      getter: ['get', 'attribute'],
      stops: [
        [1, 10],
        [2, 20],
        [3, 30],
      ],
      inputs: [1, 2, 3],
      outputs: [10, 20, 30],
      min: 1,
      max: 3,
    };
    const el = bubbles(
      expression,
      { id: '_', type: 'circle' },
      { labels: { 1: 'one', 3: 'three' } },
      map,
    );

    expect(el?.tagName).toBe('UL');
    expect(el?.classList.contains('bubbles')).toBeTruthy();
    expect(el?.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el ?? {};
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--radius: 30px;');
    expect(first?.firstElementChild?.tagName).toBe('SPAN');
    expect(first?.firstElementChild?.textContent).toBe('three');
    expect(last?.getAttribute('style')).toBe('--radius: 10px;');
  });

  it('should hide an item with label set to false', () => {
    const expression: ParsedExpression<number, number> = {
      name: 'step',
      getter: ['get', 'attribute'],
      stops: [
        [1, 10],
        [2, 20],
        [3, 30],
      ],
      inputs: [1, 2, 3],
      outputs: [10, 20, 30],
      min: 1,
      max: 3,
    };
    const el = bubbles(
      expression,
      { id: '_', type: 'circle' },
      { labels: { 1: 'one', 3: false } },
      map,
    );

    expect(el?.childElementCount).toBe(2);
  });

  it('should set legend highlighting', () => {
    const expression: ParsedExpression<number, number> = {
      name: 'step',
      getter: ['get', 'attribute'],
      stops: [
        [1, 10],
        [2, 20],
        [3, 30],
      ],
      inputs: [1, 2, 3],
      outputs: [10, 20, 30],
      min: 1,
      max: 3,
    };
    const el = bubbles(
      expression,
      { id: '_', type: 'circle' },
      { highlight: true, labels: { 1: 'one', 3: false } },
      map,
    );
    expect(el?.className).contain('--highlight');

    const setFilter = vi.spyOn(map, 'setFilter');
    el?.firstElementChild?.dispatchEvent(new Event('mouseenter'));
    el?.firstElementChild?.dispatchEvent(new Event('mouseleave'));
    expect(setFilter).toHaveBeenCalledTimes(2);
  });
});
