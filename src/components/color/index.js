import GradientBar from './gradient-bar';
import BulletList from './color-list';

export default (expression, layer) => {
  switch (expression.name) {
    case 'interpolate':
      return GradientBar(expression, layer);
    case 'match':
    case 'step':
    case 'literal':
      return BulletList(expression, layer);
    default:
      return undefined;
  }
};
