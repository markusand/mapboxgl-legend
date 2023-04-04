import { createElement, serializeLabel, map } from '../../utils';
import type { Map, Layer, ParsedExpression } from '../../types';

type Expression = ParsedExpression<number, string>;

export default (expression: Expression, layer: Layer) => {
  const { inputs, stops, min, max } = expression;
  const gradient = stops.map(([value, color]) => `${color} ${map(value, min, max)}%`);
  return createElement('div', {
    classes: 'gradient',
    content: [
      createElement('p', {
        classes: 'labels',
        content: inputs.map(input => {
          const content = serializeLabel(input, layer.metadata);
          return content && createElement('span', {
            styles: { left: `${map(input, min, max)}%` },
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
