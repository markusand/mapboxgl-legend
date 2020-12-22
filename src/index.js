import './styles.scss';
import components from './components';
import expression from './expression';
import { createElement } from './utils';

const defaults = {
	collapsed: false,
	toggler: false,
};

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
		const { collapsed, toggler } = this._options;
		this._map.getStyle().layers
			.filter(({ source, paint }) => paint && source && source !== 'composite')
			.forEach(layer => {
				const { id, type, paint, layout, metadata } = layer;
				const props = { ...paint, ...layout };
				const selector = `${this._class}-pane--${id}`;
				const prevPane = document.querySelector(`.${selector}`);
				const open = prevPane ? prevPane.open : !collapsed;
				const pane = createElement('details', {
					classes: [`${this._class}-pane`, selector],
					attributes: { open },
					content: [
						createElement('summary', {
							content: [
								(metadata && metadata.name) || id,
								...(toggler ? [this._toggleButton(id)] : []),
							],
						}),
						...Object.entries(components)
							.map(([name, component]) => {
								const parsed = expression.parse(props[`${type}-${name}`]);
								return component(parsed, layer);
							}),
					],
				});
				if (prevPane) this._container.replaceChild(pane, prevPane);
				else this._container.appendChild(pane);
			});
	}

	_toggleButton(layer) {
		const visibility = this._map.getLayoutProperty(layer, 'visibility') || 'visible';
		return createElement('button', {
			classes: ['toggler', `toggler--${visibility}`],
			attributes: {
				onclick: () => {
					const visible = visibility === 'none' ? 'visible' : 'none';
					this._map.setLayoutProperty(layer, 'visibility', visible);
				},
			},
		});
	}
}
