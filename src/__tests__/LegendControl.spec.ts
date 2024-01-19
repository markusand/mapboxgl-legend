import { describe, it, expect, vi } from 'vitest';
import type { Map } from 'mapbox-gl';
import LegendControl, { LegendControlOptions } from '../index';

const layers = [
  { id: 'skip', type: 'fill', source: 'composite' },
  { id: 'test_1', type: 'fill', source: 'source', paint: { 'fill-color': 'red' } },
  { id: 'test_2', type: 'fill', source: 'source', paint: { 'fill-color': 'blue' } },
];

const createMap = () => {
  const handlers: Record<string, Function> = {};
  return {
    on: (event: string, callback: Function) => handlers[event] = callback,
    off: (event: string) => delete handlers[event],
    dispatch: (event: string) => handlers[event]?.(),
    getStyle: () => ({ layers }),
    getLayoutProperty: () => 'visible',
    setLayoutProperty: () => 'visible',
  };
};

const createLegend = (options?: LegendControlOptions) => {
  const map = createMap();
  const control = new LegendControl(options);
  const container = control.onAdd(map as unknown as Map);
  map.dispatch('styledata');
  return { map, control, container };
};

describe('Legend Control', () => {
  it('should mount the legend control', () => {
    const { container } = createLegend();
    expect(container.classList.contains('mapboxgl-ctrl')).toBeTruthy();
    expect(container.classList.contains('mapboxgl-ctrl-legend')).toBeTruthy();
  });

  it('should mount layers panes with defaults', () => {
    const { container } = createLegend();
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes.length).toBe(2);
    expect(panes[0].getAttribute('open')).toBeTruthy();
    expect(panes[0].querySelector('toggler')).toBeFalsy();
    expect(panes[0].querySelector('summary')?.textContent).toBe('test_2');
    expect(panes[1].querySelector('summary')?.textContent).toBe('test_1');
  });

  it('should not mount layers when empty array provided', () => {
    const { container } = createLegend({ layers: [] });
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes.length).toBe(0);
  });

  it('should mount layers panes with global toggler override', () => {
    const { container } = createLegend({ toggler: true });
    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane');
    expect(pane?.querySelector('.toggler')).toBeTruthy();
  });

  it('should mount layers panes with global collapsed override', () => {
    const { container } = createLegend({ collapsed: true });
    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane');
    expect(pane).toHaveProperty('open', false);
  });

  it('should mount layers panes with global onToggle override', () => {
    const onToggle = vi.fn();
    const { container } = createLegend({ toggler: true, onToggle });
    const toggler = container.querySelector('.toggler') as HTMLButtonElement | null;
    toggler?.click();
    expect(onToggle.mock.calls).toHaveLength(1);
  });

  it('should filter mounted panes with regex string', () => {
    const { container } = createLegend({ layers: [/_1/] });
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes.length).toBe(1);
  });

  it('should filter mounted panes with boolean object', () => {
    const { container } = createLegend({ layers: { test_1: true } });
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes.length).toBe(1);
  });

  it('should mount panes with per-layer options', () => {
    const onToggleGeneric = vi.fn();
    const onToggleSpecific = vi.fn();
    const { container } = createLegend({
      toggler: false,
      collapsed: false,
      onToggle: onToggleGeneric,
      layers: {
        test_1: true,
        test_2: {
          toggler: true,
          collapsed: true,
          onToggle: onToggleSpecific,
        },
      },
    });
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes[1]).toHaveProperty('open', true);
    expect(panes[1].querySelector('.toggler')).toBeFalsy();
    expect(panes[0]).toHaveProperty('open', false);
    const toggler = panes[0].querySelector('.toggler') as HTMLButtonElement;
    expect(toggler).toBeTruthy();
    toggler!.click();
    expect(onToggleGeneric).toHaveBeenCalledTimes(0);
    expect(onToggleSpecific).toHaveBeenCalledTimes(1);
  });

  it('should remove pane', () => {
    const { control, container } = createLegend();
    expect(container.querySelectorAll('.mapboxgl-ctrl-legend-pane')).toHaveLength(2);
    control.removeLayers(['test_2']);
    expect(container.querySelectorAll('.mapboxgl-ctrl-legend-pane')).toHaveLength(1);
  });

  it('should load minimized', () => {
    const { container } = createLegend({ minimized: true });
    expect(container.querySelector('.minimizer')).toBeTruthy();
    const panes = container.querySelector('.panes') as HTMLElement;
    expect(panes).toBeTruthy();
    expect(panes.style.display).toBe('none');
  });

  it('should load expanded', () => {
    const { container } = createLegend({ minimized: false });
    expect(container.querySelector('.minimizer')).toBeTruthy();
    const panes = container.querySelector('.panes') as HTMLElement;
    expect(panes).toBeTruthy();
    expect(panes.style.display).toBe('block');
  });

  it('toggle should toggle specified layers', () => {
    const onToggle = vi.fn();
    const { container } = createLegend({
      layers: {
        test_1: true,
        test_2: {
          toggler: ['test_1', 'test_2'],
          collapsed: true,
          onToggle,
        },
      },
    });
    const toggler = container.querySelector('.toggler') as HTMLButtonElement | null;
    toggler?.click();
    expect(onToggle.mock.calls).toHaveLength(2);
  });
});
