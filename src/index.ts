import './styles/main.scss';
import { IControl } from 'mapbox-gl';
import type { Map, Layer } from 'mapbox-gl';
import components from './components';
import expression from './expression';
import { createElement } from './utils';

export type LayerOptions = {
  collapsed?: boolean;
  toggler?: boolean;
  attributes?: string[];
  onToggle?: (layer: string, visibility: boolean) => void;
};

export type LegendControlOptions = {
  layers?: string[] | Record<string, boolean | string[] | LayerOptions>
} & LayerOptions;

const defaults = {
  collapsed: false,
  toggler: false,
};

export default class LegendControl implements IControl {
  private _options: {
    layers: Record<string, LayerOptions>;
  } & Omit<LegendControlOptions, 'layers'>;
  
  private _container: HTMLElement;

  private _map!: Map;

  constructor(options: LegendControlOptions = {}) {
    const { layers, ...rest } = options;
    this._options = { ...defaults, layers: {}, ...rest };
    if (layers) this.addLayers(layers);
    this._container = createElement('div', {
      classes: ['mapboxgl-ctrl', 'mapboxgl-ctrl-legend'],
    });
    this._loadPanes = this._loadPanes.bind(this);
  }

  onAdd(map: Map) {
    this._map = map;
    this._map.on('styledata', this._loadPanes);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('styledata', this._loadPanes);
  }

  addLayers(layers: NonNullable<LegendControlOptions['layers']>) {
    const saveLayerOptions = (name: string, options: LayerOptions) => {
      const {
        collapsed = this._options.collapsed,
        toggler = this._options.toggler,
        onToggle = this._options.onToggle,
        attributes,
      } = options;
      this._options.layers[name] = { collapsed, toggler, onToggle, attributes };
    };
    
    if (Array.isArray(layers)) layers.forEach(name => saveLayerOptions(name, {}));
    else Object.entries(layers).forEach(([name, options]) => {
      if (typeof options === 'boolean') saveLayerOptions(name, {});
      else if (Array.isArray(options)) saveLayerOptions(name, { attributes: options });
      else saveLayerOptions(name, options); 
    });
    
    if (this._map?.isStyleLoaded()) this._loadPanes();
  }

  removeLayers(layerIds: string[]) {
    layerIds.forEach(id => {
      delete this._options.layers?.[id];
      const pane = document.querySelector(`.mapboxgl-ctrl-legend-pane--${id}`);
      if (pane) this._container.removeChild(pane);
    });
  }

  private _getBlock(layer: Layer, attribute: string, value: any) {
    const [property] = attribute.split('-').slice(-1);
    const component = components[property as keyof typeof components];
    if (!component) return;
    const parsed = expression.parse(value);
    return parsed && component(parsed, layer, this._map);
  }

  private _toggleButton(layerId: string, layerKey: string) {
    const { onToggle = this._options.onToggle } = this._options.layers[layerKey] || {};
    const visibility = this._map?.getLayoutProperty(layerId, 'visibility') || 'visible';
    const button = createElement('div', { classes: ['toggler', `toggler--${visibility}`] });
    button.addEventListener('click', event => {
      event.preventDefault();
      const visible = visibility === 'none' ? 'visible' : 'none';
      this._map?.setLayoutProperty(layerId, 'visibility', visible);
      onToggle?.(layerId, visible === 'visible');
    });
    return button;
  }

  private _loadPanes() {
    const layersIds = Object.keys(this._options.layers);
    this._map.getStyle().layers
      .filter(layer => (layer as Layer).source && (layer as Layer).source !== 'composite')
      .filter(layer => !layersIds.length || layersIds.some(name => layer.id.match(name)))
      .reverse() // Show in order that are drawn on map (first layers at the bottom, last on top)
      .forEach(layer => {
        const { id, layout, paint, metadata } = layer as Layer;
        const layerKey = layersIds.find(name => id.match(name)) || id;
        const {
          collapsed = this._options.collapsed,
          toggler = this._options.toggler,
          attributes,
        } = this._options.layers[layerKey] || {};

        // Construct all required blocks, break if none
        const paneBlocks = Object.entries({ ...layout, ...paint })
          .reduce((acc, [attribute, value]) => {
            const visible = attributes?.includes(attribute) ?? true;
            if (!visible) return acc;
            const block = this._getBlock(layer, attribute, value);
            if (block) acc.push(block);
            return acc;
          }, [] as HTMLElement[]);
        if (!paneBlocks.length) return;

        // (re)Construct pane and replace (if already exist)
        const selector = `mapboxgl-ctrl-legend-pane--${id}`;
        const prevPane = this._container.querySelector(`.${selector}`);
        const pane = createElement('details', {
          classes: ['mapboxgl-ctrl-legend-pane', selector],
          attributes: { open: prevPane ? prevPane.getAttribute('open') !== null : !collapsed },
          content: [
            createElement('summary', {
              content: [
                metadata?.name || id,
                toggler && this._toggleButton(id, layerKey),
              ],
            }),
            ...paneBlocks,
          ],
        });
        if (prevPane) this._container.replaceChild(pane, prevPane);
        else this._container.appendChild(pane);
      });
  }
}
