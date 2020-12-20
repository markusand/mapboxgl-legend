import { createElement, serializeLabel } from '../utils';

export default expression => {
	if (!expression) return null;
	return createElement('ul', {
		classes: ['list', 'list--color'],
		content: expression.stops.map(([value, color]) => createElement('li', {
			styles: { '--color': color },
			content: serializeLabel(value),
		})),
	});
};
