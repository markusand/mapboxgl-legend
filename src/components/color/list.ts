import { createElement, serializeLabel } from '../../utils';
import highlighter from '../../highlighter';
import type { MapboxMap, Layer, ParsedExpression, LayerOptions } from '../../types';

type Expression =  ParsedExpression<string | number | number[], string>;

export default (expression: Expression, layer: Layer, map: MapboxMap, options: LayerOptions) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  return createElement('ul', {
    classes: ['list', 'list--color', `list--${options.highlight ? 'highlight' : ''}`],
    content: stops.map(([value, color]) => {
      const content = serializeLabel(value, layer.metadata);
      return content && createElement('li', {
        styles: { '--color': color },
        events: options.highlight ? events(value) : {},
        content,
      });
    }),
  });
};
