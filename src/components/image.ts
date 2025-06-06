import { createElement, createImageCanvas, serializeLabel } from '../utils';
import highlighter from '../highlighter';
import type { MapboxMap, Layer, ParsedExpression, LayerOptions } from '../types';

type Expression = ParsedExpression<string | number, string>;

export default (expression: Expression, layer: Layer, map: MapboxMap, options: LayerOptions) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  return createElement('ul', {
    classes: ['list', 'list--icons', `list--${options.highlight ? 'highlight' : ''}`],
    content: stops.map(([value, image]) => {
      const label = serializeLabel(value, layer.metadata);
      if (!label) return undefined;
      const { height, width, data } = map.style.getImage(image)?.data || {};
      if (!height || !width || !data) return undefined;
      const canvas = createImageCanvas(data, width, height);
      return createElement('li', {
        events: options.highlight ? events(value) : {},
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
