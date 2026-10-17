import './styles/main.css';
import { IControl, LayerSpecification } from 'mapbox-gl';
import renderers from './renderers';
import Expression from './expression';
import { resolveMeta } from './metadata';
import { createElement } from './dom';
import type { MapboxMap, Layer, LayerOptions, LegendControlOptions } from './types';

export type { LayerOptions, LegendControlOptions };

const defaults: LayerOptions = {
  collapsed: false,
  toggler: false,
  highlight: false,
};

export default class LegendControl implements IControl {
  private _options: {
    layers: Map<string | RegExp, LayerOptions> | undefined;
  } & Omit<LegendControlOptions, 'layers'>;

  private _container: HTMLElement;

  private _panes: HTMLElement;

  private _minimizer: HTMLElement | undefined;

  private _stash = new Map<string | RegExp, LayerOptions>();

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

  onAdd(map: MapboxMap) {
    this._map = map;
    this._map.on('styledata', this.refresh);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('styledata', this.refresh);
  }

  addLayers(layers: NonNullable<LegendControlOptions['layers']>) {
    const saveLayerOptions = (name: string | RegExp, options?: LayerOptions) => {
      const stashed = this._stash.get(name);
      if (stashed) this._stash.delete(name);
      this._options.layers?.set(name, { ...defaults, ...this._options, ...stashed, ...options });
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

  removeLayers(layerIds: (string | RegExp)[]) {
    layerIds.forEach(id => {
      const opts = this._options.layers?.get(id);
      if (opts) this._stash.set(id, opts);
      this._options.layers?.delete(id);
      const pane = this._panes.querySelector(`.mapboxgl-ctrl-legend-pane--${id}`);
      if (pane) this._panes.removeChild(pane);
    });
  }

  private _getBlocks(key: string | RegExp, layer: Layer, attribute: string, value: unknown) {
    const [property] = attribute.split('-').slice(-1);
    const renderer = renderers[property];
    if (!renderer) return;
    const options = this._options.layers?.get(key) || this._options;
    const resolved = { ...options, ...resolveMeta(layer, options, attribute) };
    return Expression.parse(value)
      .map(expression => renderer(expression, layer, resolved, this._map))
      .filter(Boolean) as HTMLElement[];
  }

  private _toggleButton(layerIds: string[], key: string | RegExp) {
    const { onToggle = this._options.onToggle } = this._options.layers?.get(key) || {};
    const visibility = this._map?.getLayoutProperty(layerIds[0], 'visibility') || 'visible';
    const button = createElement('div', {
      classes: ['toggler', `toggler--${visibility as string}`],
    });
    button.addEventListener('click', event => {
      event.preventDefault();
      const visible = visibility === 'none' ? 'visible' : 'none';
      layerIds.forEach(layerId => {
        this._map?.setLayoutProperty(layerId, 'visibility', visible);
        onToggle?.(layerId, visible === 'visible');
      });
    });
    return button;
  }

  private _isActiveLayer = (layer: LayerSpecification) => {
    if (!('source' in layer) || layer.source === 'composite') return false;
    const match = (key: string | RegExp) =>
      typeof key === 'string' ? layer.id === key : layer.id.match(key);
    const keys = this._options.layers?.keys();
    return !keys || [...keys].some(match);
  };

  refresh = () => {
    const layersIds = this._options.layers ? [...this._options.layers.keys()] : undefined;
    const style = this._map.getStyle();
    style.layers
      .filter(this._isActiveLayer)
      .reverse()
      .forEach(layer => {
        const { id, layout, paint, metadata } = layer as Layer;
        const key = layersIds?.find(name => id.match(name)) || id;
        const { collapsed, toggler, attributes } = this._options.layers?.get(key) || this._options;

        // Construct all required blocks, break if none
        const paneBlocks = Object.entries({ ...layout, ...paint }).reduce(
          (acc, [attribute, value]) => {
            const visible = attributes?.includes(attribute) ?? true;
            if (!visible) return acc;
            const blocks = this._getBlocks(key, layer as Layer, attribute, value);
            blocks?.forEach(block => acc.push(block));
            return acc;
          },
          [] as HTMLElement[],
        );
        if (!paneBlocks.length) return;

        // (re)Construct pane and replace (if already exist)
        const selector = `mapboxgl-ctrl-legend-pane--${id}`;
        const prevPane = this._panes.querySelector(`.${selector}`);
        const layerIds = toggler ? (typeof toggler === 'boolean' ? [id] : toggler) : undefined;
        const extraClasses = metadata?.legend?.classes ?? [];
        const pane = createElement('details', {
          classes: ['mapboxgl-ctrl-legend-pane', selector, ...extraClasses],
          attributes: { open: prevPane ? prevPane.getAttribute('open') !== null : !collapsed },
          content: [
            createElement('summary', {
              content: [
                metadata?.legend?.name || id,
                layerIds && this._toggleButton(layerIds, key),
              ],
            }),
            ...paneBlocks,
          ],
        });
        if (prevPane) this._panes.replaceChild(pane, prevPane);
        else this._panes.appendChild(pane);
      });
  };
}
