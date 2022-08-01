import gradient from './gradient';
import list from './list';
import type { Layer } from 'mapbox-gl';
import type { ParsedExpression } from '/@/expression';

export type Color = `#${string}`;

export default (expression: ParsedExpression<any, any>, layer: Layer) => {
  switch (expression.name) {
    case 'interpolate':
      return gradient(expression, layer);
    case 'match':
    case 'step':
    case 'literal':
      return list(expression, layer);
    default:
      return undefined;
  }
};
