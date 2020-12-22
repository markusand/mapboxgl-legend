import { createElement, serializeLabel } from '../utils';

export default (expression, layer) => {
	if (!expression) return null;
	const { metadata: { labels } = {} } = layer;
	return createElement('ul', {
		classes: ['list', 'list--color'],
		content: expression.stops.map(([value, color]) => createElement('li', {
			styles: { '--color': color },
			content: serializeLabel(value, labels),
		})),
	});
};
