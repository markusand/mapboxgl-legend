import './styles/index.scss';

const defaults = {};

export default class LegendControl {
	constructor(options) {
		this._options = { ...defaults, ...options };
	}

	onAdd(map) {
		this._map = map;
	}

	onRemove() {}
}
