import './styles/main.css';
import { IControl, LayerSpecification } from 'mapbox-gl';
import renderers from './renderers';
import Expression from './expression';
import { resolveMeta } from './metadata';
import { createElement } from './dom';
import type { MapboxMap, Layer, LayerOptions, OnToggle, LegendControlOptions } from './types';

export type { LayerOptions, LegendControlOptions };

type LayerKey = string | RegExp;

const defaults: LayerOptions = {
  collapsed: false,
  toggler: false,
  highlight: false,
};

export default class LegendControl implements IControl {
  private _options: {
    layers: Map<LayerKey, LayerOptions> | undefined;
  } & Omit<LegendControlOptions, 'layers'>;

  private _container: HTMLElement;
  private _panes: HTMLElement;
  private _minimizer: HTMLElement | undefined;
  private _stash = new Map<LayerKey, LayerOptions>();
  private _map!: MapboxMap;

  constructor(options?: LegendControlOptions) {
    const { layers, ...rest } = options || {};
    this._options = { ...defaults, layers: undefined, ...rest };
    if (layers) this.addLayers(layers);

    this._panes = createElement('div', {
      classes: 'panes',
      styles: { display: (options?.minimized ?? false) ? 'none' : 'block' },
    });

    this._minimizer =
      options?.minimized !== undefined
        ? createElement('button', {
            classes: 'minimizer',
            events: {
              click: () => {
                const { display } = this._panes.style;
                this._panes.style.display = display === 'none' ? 'block' : 'none';
              },
            },
          })
        : undefined;

    this._container = createElement('div', {
      classes: ['mapboxgl-ctrl', 'maplibregl-ctrl', 'mapboxgl-ctrl-legend'],
      content: [this._minimizer, this._panes],
    });
  }

  onAdd(map: MapboxMap): HTMLElement {
    this._map = map;
    this._map.on('styledata', this.refresh);
    return this._container;
  }

  onRemove(): void {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('styledata', this.refresh);
  }

  addLayers(layers: NonNullable<LegendControlOptions['layers']>): void {
    const saveLayerOptions = (key: LayerKey, options?: LayerOptions) => {
      const stashed = this._stash.get(key);
      if (stashed) this._stash.delete(key);
      this._options.layers?.set(key, { ...defaults, ...this._options, ...stashed, ...options });
    };

    this._options.layers ??= new Map();
    if (Array.isArray(layers)) layers.forEach(name => saveLayerOptions(name));
    else
      Object.entries(layers).forEach(([name, options]) => {
        if (typeof options === 'boolean') saveLayerOptions(name);
        else if (Array.isArray(options)) saveLayerOptions(name, { attributes: options });
        else saveLayerOptions(name, options);
      });

    if (this._map?.isStyleLoaded()) this.refresh();
  }

  removeLayers(keys: LayerKey[]): void {
    keys.forEach(key => {
      const opts = this._options.layers?.get(key);
      if (opts) this._stash.set(key, opts);
      this._options.layers?.delete(key);
      const pane = this._panes.querySelector(`.mapboxgl-ctrl-legend-pane--${key}`);
      if (pane) this._panes.removeChild(pane);
    });
  }

  private _getBlocks(
    key: LayerKey,
    layer: Layer,
    attribute: string,
    value: unknown,
  ): HTMLElement[] | undefined {
    const [property] = attribute.split('-').slice(-1);
    const renderer = renderers[property];
    if (!renderer) return;
    const options = this._getOptions(key);
    const resolved = { ...options, ...resolveMeta(layer, options, attribute) };
    return Expression.parse(value)
      .map(expression => renderer(expression, layer, resolved, this._map))
      .filter(Boolean) as HTMLElement[];
  }

  private _toggler(layers: string[], onToggle?: OnToggle): HTMLElement {
    const visibility = this._map?.getLayoutProperty(layers[0], 'visibility') || 'visible';
    return createElement('button', {
      classes: ['toggler', `toggler--${visibility as string}`],
      events: {
        click: () => {
          const visible = visibility === 'none' ? 'visible' : 'none';
          layers.forEach(layer => {
            this._map?.setLayoutProperty(layer, 'visibility', visible);
            onToggle?.(layer, visible === 'visible');
          });
        },
      },
    });
  }

  private _isActiveLayer = (layer: LayerSpecification): boolean => {
    if (!('source' in layer) || layer.source === 'composite') return false;
    const match = (key: LayerKey) =>
      typeof key === 'string' ? layer.id === key : layer.id.match(key);
    const keys = this._options.layers?.keys();
    return !keys || [...keys].some(match);
  };

  private _resolveKey = (id: string): LayerKey => {
    const ids = Array.from(this._options.layers?.keys() ?? []);
    return ids.find(_id => id.match(_id)) ?? id;
  };

  private _getOptions = (key: LayerKey): LayerOptions => {
    return this._options.layers?.get(key) ?? this._options;
  };

  private _render = (layer: LayerSpecification): void => {
    const { id, layout, paint, metadata } = layer as Layer;
    const key = this._resolveKey(id);
    const { collapsed, attributes, toggler, onToggle } = this._getOptions(key);

    const blocks = Object.entries({ ...layout, ...paint })
      .filter(([attr]) => attributes?.includes(attr) ?? true)
      .flatMap(([attr, value]) => this._getBlocks(key, layer as Layer, attr, value) ?? []);

    if (!blocks.length) return;

    // (re)Construct pane and replace (if already exist)
    const selector = `mapboxgl-ctrl-legend-pane--${id}`;
    const prevPane = this._panes.querySelector(`.${selector}`);
    const open = prevPane ? prevPane.getAttribute('open') !== null : !collapsed;

    const toggle = toggler
      ? this._toggler(typeof toggler === 'boolean' ? [id] : toggler, onToggle)
      : false;

    const { classes = [], name = id } = metadata?.legend || {};
    const pane = createElement('details', {
      classes: ['mapboxgl-ctrl-legend-pane', selector, ...classes],
      attributes: { open },
      content: [createElement('summary', { content: [name, toggle] }), ...blocks],
    });

    if (prevPane) this._panes.replaceChild(pane, prevPane);
    else this._panes.appendChild(pane);
  };

  refresh = (): void => {
    // oxfmt-ignore
    this._map.getStyle().layers
      .filter(this._isActiveLayer)
      .reverse()
      .forEach(this._render);
  };
}
