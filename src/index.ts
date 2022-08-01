import './styles/main.scss';
import { IControl } from 'mapbox-gl';
import type { Map, Layer, Expression } from 'mapbox-gl';
import components from './components';
import expression from './expression';
import { createElement, toObject } from './utils';

type Component = keyof typeof components;
type LayersView = string[] | Record<string, boolean | string[]>;

type LegendControlOptions = {
  collapsed?: boolean;
  toggler?: boolean;
  layers?: LayersView;
};

const defaults: LegendControlOptions = {
  collapsed: false,
  toggler: false,
  layers: undefined,
};

export default class LegendControl implements IControl {
  _options: {
    layers?: Record<string, boolean | string[]>;
  } & Omit<LegendControlOptions, 'layers'>;
  
  _container: HTMLElement;
  
  _map!: Map;

  constructor(options: LegendControlOptions = {}) {
    const { layers, ...rest } = options;
    this._container = createElement('div', {
      classes: ['mapboxgl-ctrl', 'mapboxgl-ctrl-legend'],
    });
    this._options = { ...defaults, ...rest, layers: toObject(layers) };
    this._loadLayers = this._loadLayers.bind(this);
  }

  onAdd(map: Map) {
    this._map = map;
    this._map.on('styledata', this._loadLayers);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('styledata', this._loadLayers);
  }

  addLayers(layers: LayersView) {
    this._options.layers = { ...this._options.layers, ...toObject(layers) };
  }

  removeLayers(layers: string[]) {
    layers.forEach(layer => delete this._options.layers?.[layer]);
  }

  _loadLayers() {
    const { collapsed, layers } = this._options;
    this._map?.getStyle().layers
      .filter(layer => (layer as Layer).source && (layer as Layer).source !== 'composite')
      .filter(({ id }) => !layers || Object.keys(layers).some(key => id.match(key)))
      .reverse() // Show in order that are drawn on map (first layers at the bottom, last on top)
      .forEach(layer => {
        const { id, layout, paint, metadata } = layer as Layer;
        const selector = `mapboxgl-ctrl-legend-pane--${id}`;
        const prevPane = document.querySelector(`.${selector}`);
        const open = prevPane ? prevPane.getAttribute('open') !== null : !collapsed;
        const pane = createElement('details', {
          classes: ['mapboxgl-ctrl-legend-pane', selector],
          attributes: { open },
          content: [
            createElement('summary', { content: [metadata?.name || id, this._toggleButton(id)] }),
            ...Object.entries({ ...layout, ...paint })
              .filter(([attribute]) => {
                if (!layers) return true;
                const viewLayer = layers[Object.keys(layers).find(regex => id.match(regex)) || ''];
                return Array.isArray(viewLayer) ? viewLayer.includes(attribute) : viewLayer;
              })
              .map(([attribute, value]) => {
                const property = attribute.split('-').at(-1);
                const parsed = expression.parse(value as Expression | string | number);
                const component = components[property as Component];
                return parsed && component?.(parsed, layer, this._map) || undefined;
              }),
          ],
        });
        if (prevPane) this._container.replaceChild(pane, prevPane);
        else this._container.appendChild(pane);
      });
  }

  _toggleButton(layerId: string) {
    if (!this._options.toggler) return undefined;
    const visibility = this._map?.getLayoutProperty(layerId, 'visibility') || 'visible';
    const button = createElement('div', {
      classes: ['toggler', `toggler--${visibility}`],
    });
    button.addEventListener('click', event => {
      event.preventDefault();
      const visible = visibility === 'none' ? 'visible' : 'none';
      this._map?.setLayoutProperty(layerId, 'visibility', visible);
    });
    return button;
  }
}
