import { createElement, serializeLabel } from '../../utils';

export default (expression, { metadata }, map) => {
  if (!expression) return null;
  return createElement('ul', {
    classes: ['list', 'list--icons'],
    content: expression.stops.map(([value, image]) => {
      const { height, width, data } = map.style.imageManager.images[image]?.data || {};
      if (!height || !width || !data) return null;
      const size = Math.max(width, height);
      const canvas = createElement('canvas', { attributes: { width: size, height: size } });
      const ctx = canvas.getContext('2d');
      const offsetX = (size - width) / 2;
      const offsetY = (size - height) / 2;
      const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);
      ctx.putImageData(imageData, offsetX, offsetY);
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
