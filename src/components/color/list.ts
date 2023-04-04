import { createElement, serializeLabel } from '../../utils';
import type { Layer, Map, ParsedExpression, LayerOptions } from '../../types';

type Expression =  ParsedExpression<string | number | number[], string>;

export default (expression: Expression, layer: Layer, map: Map, options: LayerOptions) => {
  const { stops } = expression;
  return createElement('ul', {
    classes: ['list', 'list--color'],
    content: stops.map(([value, color]) => {
      const content = serializeLabel(value, layer.metadata);
      return content && createElement('li', {
        styles: { '--color': color },
        content,
      });
    }),
  });
};
