import './styles/main.scss';
import components from './components';
import Expression from './expression';
import { createElement, toObject } from './utils';

const defaults = {
  collapsed: false,
  toggler: false,
  layers: undefined,
};

export default class LegendControl {
  constructor(options) {
    const { layers, ...rest } = options;
    this._class = 'mapboxgl-ctrl-legend';
    this._options = { ...defaults, ...rest, layers: toObject(layers) };
    this._loadLayers = this._loadLayers.bind(this);
  }

  onAdd(map) {
    this._map = map;
    this._container = createElement('div', {
      classes: ['mapboxgl-ctrl', this._class],
    });
    this._map.on('styledata', this._loadLayers);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map.off('styledata', this._loadLayers);
    this._map = undefined;
  }

  addLayers(layers) {
    this._options.layers = { ...this._options.layers, ...toObject(layers) };
  }

  removeLayers(layers) {
    layers.forEach(layer => delete this._options.layers[layer]);
  }

  _loadLayers() {
    const { collapsed, toggler, layers } = this._options;
    this._map.getStyle().layers
      .filter(({ source }) => source && source !== 'composite')
      .filter(({ id }) => !layers || Object.keys(layers).some(key => id.match(key)))
      .reverse() // Show in order that are drawn on map (first layers at the bottom, last on top)
      .forEach(layer => {
        const { id, layout, paint, metadata } = layer;
        const selector = `${this._class}-pane--${id}`;
        const prevPane = document.querySelector(`.${selector}`);
        const pane = createElement('details', {
          classes: [`${this._class}-pane`, selector],
          attributes: {
            open: prevPane?.open ?? !collapsed,
          },
          content: [
            // Panel header
            createElement('summary', {
              content: [
                metadata?.name || id, // Layer name or identifier
                (toggler ? this._toggleButton(id) : undefined), // Toggler button
              ],
            }),
            // Panel content
            ...Object.entries({ ...layout, ...paint })
              .filter(([attribute]) => {
                if (!layers) return true;
                const match = Object.keys(layers).find(key => id.match(key));
                return layers[match] === true || layers[match]?.includes(attribute);
              })
              .map(([attribute, expression]) => {
                const property = attribute.split('-').slice(-1);
                const parsed = Expression.parse(expression);
                return parsed && components[property]?.(parsed, layer, this._map);
              }),
          ],
        });
        if (prevPane) this._container.replaceChild(pane, prevPane);
        else this._container.appendChild(pane);
      });
  }

  _toggleButton(layer) {
    const visibility = this._map.getLayoutProperty(layer, 'visibility') || 'visible';
    return createElement('div', {
      classes: ['toggler', `toggler--${visibility}`],
      attributes: {
        onclick: event => {
          event.preventDefault();
          const visible = visibility === 'none' ? 'visible' : 'none';
          this._map.setLayoutProperty(layer, 'visibility', visible);
        },
      },
    });
  }
}
