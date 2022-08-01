import { createElement, serializeLabel } from '../../utils';
import type { Layer } from 'mapbox-gl';
import type { ParsedExpression } from '/@/expression';
import type { Color } from '.';

type Expression =  ParsedExpression<string | number | number[], Color>;

export default (expression: Expression, layer: Layer) => {
  const { stops } = expression;
  return createElement('ul', {
    classes: ['list', 'list--color'],
    content: stops.map(([value, color]) => createElement('li', {
      styles: { '--color': color },
      content: serializeLabel(value, layer.metadata),
    })),
  });
};
