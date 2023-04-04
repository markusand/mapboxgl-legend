import gradient from './gradient';
import list from './list';
import type { Map, Layer, ParsedExpression } from '../../types';

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
