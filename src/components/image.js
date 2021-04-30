import { createElement, serializeLabel } from '../utils';

export default (expression, { metadata }, map) => {
	if (!expression) return null;
	return createElement('ul', {
		classes: ['list', 'list--icons'],
		content: expression.stops.map(([value, image]) => {
			const { height, width, data } = map.style.imageManager.images[image].data;
			const canvas = createElement('canvas', { attributes: { width, height } });
			const ctx = canvas.getContext('2d');
			ctx.putImageData(new ImageData(Uint8ClampedArray.from(data), width, height), 0, 0);
			return createElement('li', {
				content: [
					createElement('img', {
						classes: ['icon'],
						attributes: { src: canvas.toDataURL() },
					}),
					serializeLabel(value, metadata),
				],
			});
		}),
	});
};
