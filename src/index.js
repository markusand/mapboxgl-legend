import './styles.scss';
import { createElement } from './utils';

const defaults = {};

export default class LegendControl {
	constructor(options) {
		this._class = 'mapboxgl-ctrl-legend';
		this._options = { ...defaults, ...options };
	}

	onAdd(map) {
		this._map = map;
		this._container = createElement('div', {
			classes: ['mapboxgl-ctrl', this._class],
		});
		this._map.on('styledata', event => this._loadLayer(event));
		return this._container;
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map.off('styledata', event => this._loadLayer(event));
		this._map = undefined;
	}

	_loadLayer() {
		this._map.getStyle().layers
			.filter(({ source, paint }) => paint && source && source !== 'composite')
			.forEach(({ id }) => {
				const title = createElement('summary', { content: id });
				const pane = createElement('details', {
					classes: `${this._class}-pane`,
					content: [title],
				});
				this._container.appendChild(pane);
			});
	}
}
