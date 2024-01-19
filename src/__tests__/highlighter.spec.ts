import { describe, it, expect, vi } from 'vitest';
import highlighter from '../highlighter';

const map = { setFilter: () => {} };

const { events, highlight } = highlighter(
  { getter: ['get', 'attribute'] } as any,
  { id: 'layer_id' } as any,
  map as any,
);

describe('Highlighter', () => {
  it("should restore layer's default filter", () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    const { highlight: filteredHighlight } = highlighter(
      { getter: ['get', 'attribute'] } as any,
      { id: 'backuped', filter: ['==', ['get', 'hello'], 'world'] } as any,
      map as any,
    );
    filteredHighlight(2);
    filteredHighlight(undefined);
    expect(setFilter).toHaveBeenCalledTimes(2);
    expect(setFilter.mock.calls[1]).toStrictEqual(['backuped', ['==', ['get', 'hello'], 'world']]);
  });

  it('should apply highlight filter with number', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight(2);
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['all', ['>=', ['get', 'attribute'], 2], ['<=', ['get', 'attribute'], 2]]);
  });

  it('should apply highlight filter with number + delta', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight(2, { delta: 1 });
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['all', ['>=', ['get', 'attribute'], 1], ['<=', ['get', 'attribute'], 3]]);
  });

  it('should apply highlight filter with string', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight('item');
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['==', ['get', 'attribute'], 'item']);
  });

  it('should apply highlight filter with range array', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight([2, 3]);
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['all', ['>=', ['get', 'attribute'], 2], ['<', ['get', 'attribute'], 3]]);
  });

  it('should apply highlight filter with low unbounded range array', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight([NaN, 3]);
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['all', true, ['<', ['get', 'attribute'], 3]]);
  });

  it('should apply highlight filter with high unbounded range array', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight([2, NaN]);
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['all', ['>=', ['get', 'attribute'], 2], true]);
  });

  it('should reset highlight filter', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    highlight(undefined);
    expect(setFilter).toHaveBeenCalledWith('layer_id', null);
  });

  it('should skip highlight if literal attribute (undefined getter)', () => {
    const setFilter = vi.spyOn(map, 'setFilter');
    const { highlight: skippableHighlight } = highlighter(
      { getter: undefined } as any,
      { id: 'layer_id' } as any,
      map as any,
    );
    skippableHighlight(2);
    expect(setFilter).not.toHaveBeenCalled();
  });

  it('should be triggered by mouse events', () => {
    const mouseEvents = events('item');
    const setFilter = vi.spyOn(map, 'setFilter');
    mouseEvents.mouseenter();
    expect(setFilter).toHaveBeenCalledWith('layer_id', ['==', ['get', 'attribute'], 'item']);
    mouseEvents.mouseleave();
    expect(setFilter).toHaveBeenCalledWith('layer_id', null);
  });
});
