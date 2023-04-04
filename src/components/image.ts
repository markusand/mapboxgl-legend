import { createElement, serializeLabel } from '../utils';
import type { Map, Layer, ParsedExpression } from '../types';

type Expression = ParsedExpression<string | number, string>;

export default (expression: Expression, layer: Layer, map: Map) => {
  const { stops } = expression;
  return createElement('ul', {
    classes: ['list', 'list--icons'],
    content: stops.map(([value, image]) => {
      const label = serializeLabel(value, layer.metadata);
      if (!label) return undefined;
      // @ts-ignore Map does have an attribute style, but @types/mapbox-gl does not support it
      const { height, width, data } = map.style.getImage(image)?.data || {};
      if (!height || !width || !data) return undefined;
      const size = Math.max(width, height);
      const canvas = createElement('canvas', {
        attributes: { width: size, height: size },
      }) as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);
      ctx?.putImageData(imageData, (size - width) / 2, (size - height) / 2);
      return createElement('li', {
        content: [
          createElement('img', {
            classes: ['icon'],
            attributes: { src: canvas.toDataURL() },
          }),
          label,
        ],
      });
    }),
  });
};
