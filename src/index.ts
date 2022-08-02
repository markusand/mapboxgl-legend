import './styles/main.scss';
import { IControl } from 'mapbox-gl';
import type { Map, Layer } from 'mapbox-gl';
import components from './components';
import expression from './expression';
import { createElement, toObject } from './utils';

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
    this._loadPanels = this._loadPanels.bind(this);
  }

  onAdd(map: Map) {
    this._map = map;
    this._map.on('styledata', this._loadPanels);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('styledata', this._loadPanels);
  }

  addLayers(layers: LayersView) {
    this._options.layers = { ...this._options.layers, ...toObject(layers) };
    if (this._map.isStyleLoaded()) this._loadPanels();
  }

  removeLayers(layers: string[]) {
    layers.forEach(layer => delete this._options.layers?.[layer]);
    if (this._map.isStyleLoaded()) this._loadPanels();
  }

  _isAttributeVisible(layerId: string, attribute: string) {
    const { layers } = this._options;
    if (!layers) return true;
    const key = Object.keys(layers).find(regex => layerId.match(regex));
    const layer = !!key && layers[key];
    return Array.isArray(layer) ? layer.includes(attribute) : layer;
  }

  _getBlock(layer: Layer, attribute: string, value: any) {
    const [property] = attribute.split('-').slice(-1);
    const component = components[property as keyof typeof components];
    if (!component) return;
    const parsed = expression.parse(value);
    return parsed && component(parsed, layer, this._map);
  }

  _toggleButton(layerId: string) {
    if (!this._options.toggler) return undefined;
    const visibility = this._map?.getLayoutProperty(layerId, 'visibility') || 'visible';
    const button = createElement('div', { classes: ['toggler', `toggler--${visibility}`] });
    button.addEventListener('click', event => {
      event.preventDefault();
      const visible = visibility === 'none' ? 'visible' : 'none';
      this._map?.setLayoutProperty(layerId, 'visibility', visible);
    });
    return button;
  }

  _loadPanels() {
    const { collapsed, layers } = this._options;
    this._map.getStyle().layers
      .filter(layer => (layer as Layer).source && (layer as Layer).source !== 'composite')
      .filter(({ id }) => !layers || Object.keys(layers).some(key => id.match(key)))
      .reverse() // Show in order that are drawn on map (first layers at the bottom, last on top)
      .forEach(layer => {
        const { id, layout, paint, metadata } = layer as Layer;

        // Construct all required blocks, break if none
        const paneBlocks = Object.entries({ ...layout, ...paint })
          .reduce((acc, [attribute, value]) => {
            if (!this._isAttributeVisible(id, attribute)) return acc;
            const block = this._getBlock(layer, attribute, value);
            if (block) acc.push(block);
            return acc;
          }, [] as HTMLElement[]);
        if (!paneBlocks.length) return;

        // (re)Construct pane and replace (if already exist)
        const selector = `mapboxgl-ctrl-legend-pane--${id}`;
        const prevPane = document.querySelector(`.${selector}`);
        const pane = createElement('details', {
          classes: ['mapboxgl-ctrl-legend-pane', selector],
          attributes: { open: prevPane ? prevPane.getAttribute('open') !== null : !collapsed },
          content: [
            createElement('summary', { content: [metadata?.name || id, this._toggleButton(id)] }),
            ...paneBlocks,
          ],
        });
        if (prevPane) this._container.replaceChild(pane, prevPane);
        else this._container.appendChild(pane);
      });
  }
}
