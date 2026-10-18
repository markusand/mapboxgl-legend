import { describe, it, expect, vi } from 'vite-plus/test';
import LegendControl, { LegendControlOptions } from '/@/index';
import type { MapboxMap } from '/@/types';

const layers = [
  { id: 'skip', type: 'fill', source: 'composite' },
  { id: 'test_1', type: 'fill', source: 'source', paint: { 'fill-color': 'red' } },
  { id: 'test_2', type: 'fill', source: 'source', paint: { 'fill-color': 'blue' } },
  {
    id: 'test_classes',
    type: 'fill',
    source: 'source',
    paint: { 'fill-color': 'green' },
    metadata: { legend: { classes: ['test-custom-class'] } },
  },
  {
    id: 'test_zoom',
    type: 'fill',
    source: 'source',
    minzoom: 8,
    maxzoom: 14,
    paint: { 'fill-color': 'orange' },
  },
  {
    id: 'test_properties',
    type: 'circle',
    source: 'source',
    paint: {
      'circle-color': ['match', ['get', 'type'], 'a', '#f00', 'b', '#0f0', '#ccc'],
      'circle-radius': ['match', ['get', 'type'], 'a', 5, 'b', 10, 1],
    },
    metadata: {
      legend: {
        unit: 'default',
        properties: {
          'circle-radius': { unit: 'px' },
        },
      },
    },
  },
];

const createMap = (zoom = 12) => {
  // oxlint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const handlers: Record<string, Function> = {};
  return {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-function-type
    on: (event: string, callback: Function) => (handlers[event] = callback),
    off: (event: string) => delete handlers[event],
    dispatch: (event: string) => handlers[event]?.(),
    getStyle: () => ({ layers }),
    getZoom: () => zoom,
    getLayoutProperty: () => 'visible',
    setLayoutProperty: () => 'visible',
  };
};

const createLegend = (options?: LegendControlOptions) => {
  const map = createMap();
  const control = new LegendControl(options);
  const container = control.onAdd(map as unknown as MapboxMap);
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
    expect(panes.length).toBe(5);
    expect(panes[3].getAttribute('open')).toBeTruthy();
    expect(panes[3].querySelector('toggler')).toBeFalsy();
    expect(panes[3].querySelector('summary')?.textContent).toBe('test_2');
    expect(panes[4].querySelector('summary')?.textContent).toBe('test_1');
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

  it('should filter mounted panes with string', () => {
    const { container } = createLegend({ layers: ['test_1'] });
    const panes = container.querySelectorAll('.mapboxgl-ctrl-legend-pane');
    expect(panes.length).toBe(1);
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
    expect(container.querySelectorAll('.mapboxgl-ctrl-legend-pane')).toHaveLength(5);
    control.removeLayers(['test_2']);
    expect(container.querySelectorAll('.mapboxgl-ctrl-legend-pane')).toHaveLength(4);
  });

  it('should apply per-property metadata', () => {
    const { container } = createLegend({ layers: ['test_properties'] });
    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_properties');
    const colorList = pane?.querySelector('.list--color');
    const radiusList = pane?.querySelector('.bubbles');
    // Color list uses base unit
    expect(colorList?.firstElementChild?.textContent).toBe('adefault');
    // Radius list uses overridden unit
    expect(radiusList?.querySelector('span')?.textContent).toContain('px');
  });

  it('should apply function metadata from control options', () => {
    const { container } = createLegend({
      layers: {
        test_properties: {
          unit: (v: unknown) => (v === 'a' ? ' (type A)' : ' (type B)'),
        },
      },
    });
    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_properties');
    const colorList = pane?.querySelector('.list--color');
    // Function unit from control options overrides static unit from layer metadata
    expect(colorList?.firstElementChild?.textContent).toBe('a (type A)');
  });

  it('should allow adding classes to specific layers', () => {
    const { container } = createLegend();
    expect(container.querySelector('.test-custom-class')).toBeTruthy();
  });

  it('should load minimized', () => {
    const { container } = createLegend({ minimized: true });
    expect(container.querySelector('.minimize')).toBeTruthy();
    expect(container.hasAttribute('open')).toBe(false);
  });

  it('should load expanded', () => {
    const { container } = createLegend({ minimized: false });
    expect(container.querySelector('.minimize')).toBeTruthy();
    expect(container.hasAttribute('open')).toBe(true);
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

  it('should mark pane out-of-range when zoom is below minzoom', () => {
    const map = createMap(5);
    const control = new LegendControl();
    const container = control.onAdd(map as unknown as MapboxMap);
    map.dispatch('styledata');

    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_zoom');
    expect(pane?.classList.contains('out-of-range')).toBeTruthy();
  });

  it('should mark pane out-of-range when zoom is at or above maxzoom', () => {
    const map = createMap(14);
    const control = new LegendControl();
    const container = control.onAdd(map as unknown as MapboxMap);
    map.dispatch('styledata');

    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_zoom');
    expect(pane?.classList.contains('out-of-range')).toBeTruthy();
  });

  it('should not mark pane out-of-range when zoom is within bounds', () => {
    const map = createMap(10);
    const control = new LegendControl();
    const container = control.onAdd(map as unknown as MapboxMap);
    map.dispatch('styledata');

    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_zoom');
    expect(pane?.classList.contains('out-of-range')).toBeFalsy();
  });

  it('should update out-of-range on zoomend', () => {
    let zoom = 10;
    const map = createMap();
    (map as unknown as Record<string, unknown>).getZoom = () => zoom;
    const control = new LegendControl();
    const container = control.onAdd(map as unknown as MapboxMap);
    map.dispatch('styledata');

    const pane = container.querySelector('.mapboxgl-ctrl-legend-pane--test_zoom');
    expect(pane?.classList.contains('out-of-range')).toBeFalsy();

    zoom = 3;
    map.dispatch('zoomend');
    expect(pane?.classList.contains('out-of-range')).toBeTruthy();

    zoom = 10;
    map.dispatch('zoomend');
    expect(pane?.classList.contains('out-of-range')).toBeFalsy();
  });
});
