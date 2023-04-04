import gradient from './gradient';
import list from './list';
import type { Map, Layer, ParsedExpression, LayerOptions } from '../../types';

type Expression = ParsedExpression<any, any>;

export default (expression: Expression, layer: Layer, map: Map, options: LayerOptions) => {
  switch (expression.name) {
    case 'interpolate':
      return gradient(expression, layer, map, options);
    case 'match':
    case 'step':
    case 'literal':
      return list(expression, layer, map, options);
    default:
      return undefined;
  }
};
