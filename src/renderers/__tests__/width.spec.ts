import { describe, it, expect, vi } from 'vite-plus/test';
import width from '../width';
import type { MapboxMap, ParsedExpression } from '/@/types';

const map = {
  setFilter: () => {},
  getLayoutProperty: () => undefined,
  getPaintProperty: () => undefined,
} as unknown as MapboxMap;

const expression: ParsedExpression<number, number> = {
  name: 'interpolate',
  getter: ['get', 'volume'],
  stops: [
    [0, 1],
    [50, 3],
    [100, 6],
  ],
  inputs: [0, 50, 100],
  outputs: [1, 3, 6],
  min: 0,
  max: 100,
};

describe('Width panel', () => {
  it('should create a panel with lines', () => {
    const el = width(
      expression,
      { id: '_', type: 'line' },
      { labels: { 0: 'Low', 100: 'High' } },
      map,
    );

    expect(el?.tagName).toBe('UL');
    expect(el?.classList.contains('lines')).toBeTruthy();
    expect(el?.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el ?? {};
    expect(first?.tagName).toBe('LI');
    expect(first?.getAttribute('style')).toBe('--width: 1px; --dash: 0px; --gap: 0px;');
    expect(first?.firstElementChild?.textContent).toBe('Low');
    expect(last?.getAttribute('style')).toBe('--width: 6px; --dash: 0px; --gap: 0px;');
    expect(last?.firstElementChild?.textContent).toBe('High');
  });

  it('should hide an item with label set to false', () => {
    const el = width(
      expression,
      { id: '_', type: 'line' },
      { labels: { 0: 'Low', 100: false } },
      map,
    );

    expect(el?.childElementCount).toBe(2);
  });

  it('should set legend highlighting', () => {
    const el = width(expression, { id: '_', type: 'line' }, { highlight: true }, map);
    expect(el?.className).contain('--highlight');

    const setFilter = vi.spyOn(map, 'setFilter');
    el?.firstElementChild?.dispatchEvent(new Event('mouseenter'));
    el?.firstElementChild?.dispatchEvent(new Event('mouseleave'));
    expect(setFilter).toHaveBeenCalledTimes(2);
  });

  it('should apply round line cap class', () => {
    const roundMap = {
      setFilter: () => {},
      getLayoutProperty: () => 'round',
      getPaintProperty: () => undefined,
    } as unknown as MapboxMap;

    const el = width(expression, { id: '_', type: 'line' }, {}, roundMap);

    expect(el?.classList.contains('lines--round')).toBeTruthy();
  });

  it('should default to butt line cap', () => {
    const el = width(expression, { id: '_', type: 'line' }, {}, map);

    expect(el?.classList.contains('lines--butt')).toBeTruthy();
  });

  it('should apply dashed class when dasharray is set', () => {
    const dashedMap = {
      setFilter: () => {},
      getLayoutProperty: () => undefined,
      getPaintProperty: () => [2, 1],
    } as unknown as MapboxMap;

    const el = width(expression, { id: '_', type: 'line' }, {}, dashedMap);

    expect(el?.classList.contains('lines--dashed')).toBeTruthy();
    const first = el?.firstElementChild;
    expect(first?.getAttribute('style')).toBe('--width: 1px; --dash: 2px; --gap: 1px;');
    const last = el?.lastElementChild;
    expect(last?.getAttribute('style')).toBe('--width: 6px; --dash: 12px; --gap: 6px;');
  });

  it('should not apply line cap class when dasharray is set', () => {
    const dashedRoundMap = {
      setFilter: () => {},
      getLayoutProperty: () => 'round',
      getPaintProperty: () => [2, 1],
    } as unknown as MapboxMap;

    const el = width(expression, { id: '_', type: 'line' }, {}, dashedRoundMap);

    expect(el?.classList.contains('lines--dashed')).toBeTruthy();
    expect(el?.classList.contains('lines--round')).toBeFalsy();
  });
});
