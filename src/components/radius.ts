import { createElement, serializeLabel } from '../utils';
import type { Layer } from 'mapbox-gl';
import type { ParsedExpression } from '/@/expression';

type Expression = ParsedExpression<string | number, number>;

export default (expression: Expression, layer: Layer) => {
  const { stops } = expression;
  return createElement('ul', {
    classes: 'bubbles',
    content: stops.sort((a, b) => b[1] - a[1]) // order from bigger to smaller
      .map(([value, radius]) => {
        const content = serializeLabel(value, layer.metadata);
        return content && createElement('li', {
          styles: { '--radius': `${radius}px` },
          content: createElement('span', {
            content,
          }),
        });
      }),
  });
};
