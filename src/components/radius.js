import { createElement, serializeLabel } from '../utils';

export default (expression, layer) => {
	if (!expression) return null;
	const { metadata: { labels } = {} } = layer;
	return createElement('ul', {
		classes: 'bubbles',
		content: expression.stops
			.sort((a, b) => b[1] - a[1]) // order from bigger to smaller
			.map(([value, radius]) => createElement('li', {
				styles: { '--radius': `${radius}px` },
				content: createElement('span', {
					content: serializeLabel(value, labels),
				}),
			})),
	});
};
