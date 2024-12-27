import { createElement, serializeLabel } from '../utils';
import highlighter from '../highlighter';
import type { MapboxMap, Layer, ParsedExpression, LayerOptions } from '../types';

type Expression = ParsedExpression<string | number, number>;

export default (expression: Expression, layer: Layer, map: MapboxMap, options: LayerOptions) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  return createElement('ul', {
    classes: ['bubbles', `bubbles--${options.highlight ? 'highlight' : ''}`],
    content: stops
      .sort((a, b) => b[1] - a[1]) // order from bigger to smaller
      .map(([value, radius]) => {
        const content = serializeLabel(value, layer.metadata);
        return content && createElement('li', {
          styles: { '--radius': `${radius}px` },
          events: options.highlight ? events(value) : {},
          content: createElement('span', {
            content,
          }),
        });
      }),
  });
};
