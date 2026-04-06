import gradient from './gradient';
import list from './list';
import type { Renderer } from '../../types';

type ColorRenderer = Renderer<any, any>;

const renderer: ColorRenderer = (expression, layer, map, options) => {
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

export default renderer;
