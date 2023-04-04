import { createElement, serializeLabel, rescale } from '../../utils';
import type { Map, Layer, ParsedExpression, LayerOptions } from '../../types';

type Expression = ParsedExpression<number, string>;

export default (expression: Expression, layer: Layer, map: Map, options: LayerOptions) => {
  const { inputs, stops, min, max } = expression;
  const gradient = stops.map(([value, color]) => `${color} ${rescale(value, min, max)}%`);
  return createElement('div', {
    classes: 'gradient',
    content: [
      createElement('p', {
        classes: 'labels',
        content: inputs.map(input => {
          const content = serializeLabel(input, layer.metadata);
          return content && createElement('span', {
            styles: { left: `${rescale(input, min, max)}%` },
            content,
          });
        }),
      }),
      createElement('div', {
        classes: 'bar',
        styles: { 'background-image': `linear-gradient(90deg, ${gradient})` },
      }),
    ],
  });
};
