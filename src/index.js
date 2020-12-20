import './styles.scss';
import components from './components';
import expression from './expression';
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
			.forEach(({ id, type, paint, layout }) => {
				const props = { ...paint, ...layout };
				const pane = createElement('details', {
					classes: `${this._class}-pane`,
					content: [
						createElement('summary', { content: id }),
						...Object.entries(components)
							.map(([name, component]) => {
								const parsed = expression.parse(props[`${type}-${name}`]);
								return component(parsed);
							}),
					],
				});
				this._container.appendChild(pane);
			});
	}
}
