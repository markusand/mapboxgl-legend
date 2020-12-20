import { createElement } from '../utils';

export default expression => {
	if (!expression) return null;
	return createElement('ul', {
		classes: 'bubbles',
		content: expression.stops
			.sort((a, b) => b[1] - a[1]) // order from bigger to smaller
			.map(([value, radius]) => createElement('li', {
				styles: { '--radius': `${radius}px` },
				content: createElement('span', { content: value }),
			})),
	});
};
